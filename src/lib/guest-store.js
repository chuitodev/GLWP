import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const PORTAL_FILENAME = "guest-portal.json";
const RSVP_HISTORY_FILENAME = "guest-rsvp-history.ndjson";
const SEND_JOBS_FILENAME = "guest-send-jobs.ndjson";
const PORTAL_VERSION = 1;

export function createGuestPortalStore({ dataDir, loadConfig }) {
  const portalPath = path.join(dataDir, PORTAL_FILENAME);
  const rsvpHistoryPath = path.join(dataDir, RSVP_HISTORY_FILENAME);
  const sendJobsPath = path.join(dataDir, SEND_JOBS_FILENAME);

  return {
    portalPath,
    rsvpHistoryPath,
    sendJobsPath,

    async ensure() {
      await fs.mkdir(dataDir, { recursive: true });

      try {
        await fs.access(portalPath);
      } catch {
        const seeded = createSeedPortal(await loadConfig());
        await writeAtomicJson(portalPath, seeded);
      }
    },

    async load() {
      await this.ensure();
      const raw = await fs.readFile(portalPath, "utf8");
      return normalizePortal(JSON.parse(raw));
    },

    async save(portal) {
      await this.ensure();
      const normalized = normalizePortal(portal);
      await writeAtomicJson(portalPath, normalized);
      return normalized;
    },

    async getAdminSnapshot({ baseUrl } = {}) {
      const portal = await this.load();
      const jobs = await this.listSendJobs({ baseUrl, limit: 200 });
      return decoratePortal(portal, { baseUrl, jobs });
    },

    async updateMeta(input = {}) {
      const portal = await this.load();
      portal.totalCapacity = normalizeCapacity(input.totalCapacity);
      const saved = await this.save(portal);
      return decoratePortal(saved);
    },

    async createGroup(input = {}) {
      const portal = await this.load();
      const group = createGroupRecord(input, {
        prefix: portal.eventCodePrefix,
        sequence: portal.nextInvitationSequence,
      });
      portal.groups.push(group);
      portal.nextInvitationSequence += 1;
      const saved = await this.save(portal);
      return decorateGroup(findGroup(saved, group.id));
    },

    async updateGroup(groupId, input = {}) {
      const portal = await this.load();
      const group = findGroup(portal, groupId);

      group.familyLabel = asString(input.familyLabel, group.familyLabel);
      group.contact = normalizeContact({ ...group.contact, ...asObject(input.contact) });
      group.updatedAt = nowIso();

      if (Array.isArray(input.members) && input.members.length) {
        group.members = input.members.map((member, index) =>
          normalizeMember({ ...member, sortOrder: index }, index, group.members[index])
        );
      }

      const saved = await this.save(portal);
      return decorateGroup(findGroup(saved, groupId));
    },

    async deleteGroup(groupId) {
      const portal = await this.load();
      const index = portal.groups.findIndex((group) => group.id === groupId);
      if (index === -1) {
        throw createStoreError("guest_group_not_found", "No se encontro el grupo solicitado.");
      }
      const [removed] = portal.groups.splice(index, 1);
      await this.save(portal);
      return { ok: true, removedGroupId: removed.id };
    },

    async addMember(groupId, input = {}) {
      const portal = await this.load();
      const group = findGroup(portal, groupId);
      const nextSortOrder = group.members.length;
      group.members.push(normalizeMember({ ...input, sortOrder: nextSortOrder }, nextSortOrder));
      group.updatedAt = nowIso();
      const saved = await this.save(portal);
      return decorateGroup(findGroup(saved, groupId));
    },

    async updateMember(groupId, memberId, input = {}) {
      const portal = await this.load();
      const group = findGroup(portal, groupId);
      const index = group.members.findIndex((member) => member.id === memberId);

      if (index === -1) {
        throw createStoreError("guest_member_not_found", "No se encontro el integrante solicitado.");
      }

      const existing = group.members[index];
      group.members[index] = normalizeMember(
        {
          ...existing,
          ...asObject(input),
          id: existing.id,
          sortOrder: existing.sortOrder,
          role: existing.role,
        },
        index,
        existing
      );
      group.updatedAt = nowIso();
      const saved = await this.save(portal);
      return decorateGroup(findGroup(saved, groupId));
    },

    async removeMember(groupId, memberId) {
      const portal = await this.load();
      const group = findGroup(portal, groupId);

      if (group.members.length <= 1) {
        throw createStoreError(
          "guest_member_required",
          "Cada invitacion debe conservar al menos un integrante."
        );
      }

      const index = group.members.findIndex((member) => member.id === memberId);
      if (index === -1) {
        throw createStoreError("guest_member_not_found", "No se encontro el integrante solicitado.");
      }

      group.members.splice(index, 1);
      group.updatedAt = nowIso();
      const saved = await this.save(portal);
      return decorateGroup(findGroup(saved, groupId));
    },

    async queueSend(groupId, { baseUrl } = {}) {
      const portal = await this.load();
      const group = findGroup(portal, groupId);

      if (!group.publicToken) {
        group.publicToken = createPublicToken();
      }

      const invitePath = buildInvitePath(group.publicToken);
      const inviteUrl = buildInviteUrl(baseUrl, invitePath);
      const jobId = createId("job");
      const timestamp = nowIso();

      group.delivery.status = "queued";
      group.delivery.lastQueuedAt = timestamp;
      group.delivery.lastJobId = jobId;
      group.updatedAt = timestamp;

      await this.save(portal);

      const payload = {
        jobId,
        groupId: group.id,
        invitationCode: group.invitationCode,
        invitePath,
        inviteUrl,
        contactName: group.members[0]?.displayName || group.familyLabel,
        contactPhoneE164: group.contact.phoneE164,
        payloadVersion: 1,
        status: "queued",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await appendNdjson(sendJobsPath, payload);

      return {
        ok: true,
        job: payload,
        group: decorateGroup(normalizeGroupRecord(group), { baseUrl }),
      };
    },

    async queueSendBulk(groupIds = [], { baseUrl } = {}) {
      const uniqueIds = [...new Set((Array.isArray(groupIds) ? groupIds : []).filter(Boolean))];
      const jobs = [];

      for (const groupId of uniqueIds) {
        const result = await this.queueSend(groupId, { baseUrl });
        jobs.push(result.job);
      }

      return {
        ok: true,
        count: jobs.length,
        jobs,
      };
    },

    async listSendJobs({ baseUrl, limit = 200 } = {}) {
      const rows = await readNdjson(sendJobsPath);
      const latestByJobId = new Map();

      for (const row of rows) {
        if (!row.jobId) continue;
        latestByJobId.set(row.jobId, row);
      }

      const jobs = [...latestByJobId.values()]
        .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
        .slice(0, limit)
        .map((job) => ({
          ...job,
          inviteUrl: buildInviteUrl(baseUrl, job.invitePath || ""),
        }));

      return jobs;
    },

    async markSendJob(jobId, nextStatus, details = {}) {
      const status = nextStatus === "sent" ? "sent" : "failed";
      const jobs = await readNdjson(sendJobsPath);
      const current = [...jobs].reverse().find((job) => job.jobId === jobId);

      if (!current) {
        throw createStoreError("send_job_not_found", "No se encontro el job de envio solicitado.");
      }

      const portal = await this.load();
      const group = findGroup(portal, current.groupId);
      const timestamp = nowIso();

      if (status === "sent") {
        group.delivery.status = "sent";
        group.delivery.lastSentAt = timestamp;
      } else {
        group.delivery.status = "failed";
        group.delivery.lastFailedAt = timestamp;
      }

      group.updatedAt = timestamp;
      await this.save(portal);

      const updatedJob = {
        ...current,
        ...asObject(details),
        status,
        updatedAt: timestamp,
      };

      await appendNdjson(sendJobsPath, updatedJob);

      return {
        ok: true,
        job: updatedJob,
        group: decorateGroup(findGroup(await this.load(), group.id)),
      };
    },

    async reopenRsvp(groupId) {
      const portal = await this.load();
      const group = findGroup(portal, groupId);
      const timestamp = nowIso();

      group.rsvp.status = "pending";
      group.rsvp.lockedAt = "";
      group.rsvp.reopenedAt = timestamp;
      group.rsvp.latestSubmissionId = "";
      group.rsvp.latestSubmittedAt = "";
      group.rsvp.summary = null;
      group.updatedAt = timestamp;

      await this.save(portal);

      return {
        ok: true,
        group: decorateGroup(findGroup(await this.load(), group.id)),
      };
    },

    async getInvite(token, { baseUrl } = {}) {
      const portal = await this.load();
      const group = portal.groups.find((item) => item.publicToken === token);

      if (!group) {
        throw createStoreError("invite_not_found", "No se encontro la invitacion solicitada.");
      }

      return decorateGroup(group, { baseUrl });
    },

    async submitInviteResponse(token, payload = {}) {
      const portal = await this.load();
      const group = portal.groups.find((item) => item.publicToken === token);

      if (!group) {
        throw createStoreError("invite_not_found", "No se encontro la invitacion solicitada.");
      }

      if (group.rsvp.lockedAt) {
        throw createStoreError(
          "invite_locked",
          "Esta invitacion ya registro una respuesta y se encuentra bloqueada."
        );
      }

      const submittedGuests = normalizeSubmittedGuests(payload.guests, group.members);
      const submissionId = createId("rsvp");
      const timestamp = nowIso();
      const summary = buildRsvpSummary(submittedGuests, payload.note);

      group.rsvp.status = summary.attendingCount > 0 ? "confirmed" : "declined";
      group.rsvp.lockedAt = timestamp;
      group.rsvp.latestSubmissionId = submissionId;
      group.rsvp.latestSubmittedAt = timestamp;
      group.rsvp.summary = summary;
      group.updatedAt = timestamp;

      await this.save(portal);

      await appendNdjson(rsvpHistoryPath, {
        submissionId,
        groupId: group.id,
        invitationCode: group.invitationCode,
        submittedAt: timestamp,
        note: summary.note,
        guests: summary.guests,
      });

      return {
        ok: true,
        message: "RSVP guardado correctamente.",
        group: decorateGroup(findGroup(await this.load(), group.id)),
      };
    },

    async importCsv(csvText = "") {
      const rows = parseCsv(csvText);
      if (rows.length <= 1) {
        throw createStoreError(
          "csv_empty",
          "El CSV no contiene filas suficientes para importar invitados."
        );
      }

      const [headerRow, ...dataRows] = rows;
      const headers = headerRow.map((value) => normalizeCsvHeader(value));
      validateImportHeaders(headers);

      const grouped = new Map();

      for (const row of dataRows) {
        if (!row.some((cell) => String(cell || "").trim())) continue;

        const record = Object.fromEntries(headers.map((header, index) => [header, asString(row[index])]));
        const groupKey = record.group_key || `group-${crypto.randomUUID()}`;
        const item = grouped.get(groupKey) || [];
        item.push(record);
        grouped.set(groupKey, item);
      }

      if (!grouped.size) {
        throw createStoreError("csv_empty", "No se encontraron invitados validos dentro del CSV.");
      }

      const portal = await this.load();
      let importedMembers = 0;
      let importedGroups = 0;

      for (const records of grouped.values()) {
        const primaryRows = records.filter((item) => parseBoolean(item.is_primary));

        if (primaryRows.length !== 1) {
          throw createStoreError(
            "csv_primary_invalid",
            "Cada group_key debe incluir exactamente un invitado principal."
          );
        }

        const primaryRow = primaryRows[0];
        const members = records.map((record, index) => ({
          firstName: record.first_name,
          lastNamePaternal: record.last_name_paternal,
          lastNameMaternal: record.last_name_maternal,
          anonymousPlusOne: !parseBoolean(record.is_primary) && parseBoolean(record.is_anonymous_plus_one),
          role: parseBoolean(record.is_primary) ? "primary" : "plus_one",
          sortOrder: index,
        }));

        const group = createGroupRecord(
          {
            familyLabel: primaryRow.family_label,
            contact: {
              countryCode: primaryRow.country_code,
              phoneNumber: primaryRow.phone_number,
            },
            members,
          },
          {
            prefix: portal.eventCodePrefix,
            sequence: portal.nextInvitationSequence,
          }
        );

        portal.groups.push(group);
        portal.nextInvitationSequence += 1;
        importedGroups += 1;
        importedMembers += group.members.length;
      }

      await this.save(portal);

      return {
        ok: true,
        importedGroups,
        importedMembers,
      };
    },

    getTemplateCsv() {
      return [
        "group_key,is_primary,is_anonymous_plus_one,first_name,last_name_paternal,last_name_maternal,family_label,country_code,phone_number",
        'grupo-1,true,false,Juan,Perez,Lopez,Familia Perez Lopez,+52,8112345678',
        'grupo-1,false,false,Maria,Perez,Lopez,Familia Perez Lopez,,',
        'grupo-1,false,true,,,,Familia Perez Lopez,,',
      ].join("\n");
    },

    async exportWorkbook({ baseUrl } = {}) {
      const portal = await this.load();
      const decorated = portal.groups.map((group) => decorateGroup(group, { baseUrl }));
      const summaryRows = decorated.map((group) => ({
        Codigo: group.invitationCode,
        Familia: group.familyLabel,
        Estado: group.displayStatusLabel,
        "Enlace publico": group.inviteUrl,
        "Telefono E164": group.contact.phoneE164,
        "Total invitados": group.guestCount,
        Confirmados: group.confirmedCount,
        "Fecha de envio": group.delivery.lastSentAt || "",
        "Fecha RSVP": group.rsvp.latestSubmittedAt || "",
      }));

      const detailRows = decorated.flatMap((group) =>
        group.members.map((member) => {
          const guestResponse = group.rsvp.summary?.guests?.find((guest) => guest.memberId === member.id);
          return {
            Codigo: group.invitationCode,
            Familia: group.familyLabel,
            Rol:
              member.role === "primary"
                ? "Principal"
                : member.anonymousPlusOne
                  ? "Plus one anonimo"
                  : "Acompanante",
            Nombre: member.firstName,
            "Apellido paterno": member.lastNamePaternal,
            "Apellido materno": member.lastNameMaternal,
            "Nombre visible": member.displayName,
            "Telefono E164": group.contact.phoneE164,
            Estado: group.displayStatusLabel,
            Asistencia: mapAttendanceLabel(guestResponse?.attendance),
            Restriccion: guestResponse?.dietaryRestriction || "",
          };
        })
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(summaryRows.length ? summaryRows : [{ Codigo: "", Familia: "" }]),
        "Resumen"
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(detailRows.length ? detailRows : [{ Codigo: "", Nombre: "" }]),
        "Integrantes"
      );

      return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    },
  };
}

export function buildEventCodePrefix(bride, groom) {
  const first = findInitial(bride);
  const second = findInitial(groom);
  return `${first || "E"}${second || "V"}`;
}

export function createInvitationCode(prefix, sequence) {
  const safePrefix = asString(prefix, "EV").toUpperCase();
  const safeSequence = Math.max(Number(sequence) || 1, 1);
  return `${safePrefix}${String(safeSequence).padStart(3, "0")}`;
}

export function createPublicToken() {
  return crypto.randomBytes(18).toString("base64url");
}

export function buildInvitePath(token) {
  return `/invite/${encodeURIComponent(token)}`;
}

function createGroupRecord(input = {}, { prefix, sequence }) {
  const now = nowIso();
  return normalizeGroupRecord(
    {
      id: createId("group"),
      invitationCode: createInvitationCode(prefix, sequence),
      publicToken: asString(input.publicToken),
      familyLabel: asString(input.familyLabel),
      eventCodePrefix: prefix,
      sequence,
      contact: normalizeContact(asObject(input.contact)),
      delivery: {
        status: "not_sent",
        lastQueuedAt: "",
        lastSentAt: "",
        lastFailedAt: "",
        lastJobId: "",
      },
      rsvp: {
        status: "pending",
        lockedAt: "",
        reopenedAt: "",
        latestSubmissionId: "",
        latestSubmittedAt: "",
        summary: null,
      },
      members: normalizeInputMembers(input.members, input.primaryMember),
      createdAt: now,
      updatedAt: now,
    },
    sequence - 1,
    prefix
  );
}

function createSeedPortal(config = {}) {
  const prefix = buildEventCodePrefix(config?.couple?.bride, config?.couple?.groom);
  const guestList = Array.isArray(config?.rsvp?.guests) ? config.rsvp.guests : [];
  const group = createGroupRecord(
    {
      familyLabel: config?.rsvp?.groupName || "Grupo principal",
      members: guestList.map((guest, index) => ({
        ...parseLegacyName(guest?.name),
        role: index === 0 ? "primary" : "plus_one",
        sortOrder: index,
      })),
    },
    {
      prefix,
      sequence: 1,
    }
  );

  return normalizePortal({
    version: PORTAL_VERSION,
    eventCodePrefix: prefix,
    nextInvitationSequence: 2,
    totalCapacity: 0,
    groups: [group],
  });
}

function normalizeInputMembers(members, primaryMember) {
  if (Array.isArray(members) && members.length) {
    return members.map((member, index) => ({
      role: index === 0 ? "primary" : "plus_one",
      sortOrder: index,
      ...asObject(member),
    }));
  }

  return [
    {
      role: "primary",
      sortOrder: 0,
      ...asObject(primaryMember),
    },
  ];
}

function normalizePortal(input = {}) {
  const portal = {
    version: PORTAL_VERSION,
    eventCodePrefix: asString(input.eventCodePrefix, "EV").toUpperCase(),
    nextInvitationSequence: Math.max(Number(input.nextInvitationSequence) || 1, 1),
    totalCapacity: normalizeCapacity(input.totalCapacity),
    groups: Array.isArray(input.groups) ? input.groups : [],
  };

  portal.groups = portal.groups
    .map((group, index) => normalizeGroupRecord(group, index, portal.eventCodePrefix))
    .sort((a, b) => a.sequence - b.sequence);

  return portal;
}

function normalizeGroupRecord(input = {}, index = 0, prefix = "EV") {
  const now = nowIso();
  const rawMembers = Array.isArray(input.members) ? input.members : [];
  const members = rawMembers
    .map((member, memberIndex) => normalizeMember(member, memberIndex))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!members.length) {
    members.push(
      normalizeMember(
        {
          firstName: "",
          lastNamePaternal: "",
          lastNameMaternal: "",
          role: "primary",
          sortOrder: 0,
        },
        0
      )
    );
  }

  let anonymousIndex = 0;
  const normalizedMembers = members.map((member, memberIndex) => {
    const role = memberIndex === 0 ? "primary" : "plus_one";
    const anonymousPlusOne = role === "plus_one" && Boolean(member.anonymousPlusOne);
    if (anonymousPlusOne) {
      anonymousIndex += 1;
    }
    return {
      ...member,
      role,
      anonymousPlusOne,
      sortOrder: memberIndex,
      displayName: buildMemberDisplayName(
        { ...member, role, anonymousPlusOne },
        anonymousPlusOne ? anonymousIndex : 0
      ),
    };
  });

  const sequence = Math.max(Number(input.sequence) || index + 1, 1);
  const invitationCode = asString(
    input.invitationCode,
    createInvitationCode(input.eventCodePrefix || prefix, sequence)
  );

  const group = {
    id: asString(input.id, createId("group")),
    invitationCode,
    publicToken: asString(input.publicToken),
    familyLabel: asString(input.familyLabel),
    eventCodePrefix: asString(input.eventCodePrefix, prefix).toUpperCase(),
    sequence,
    contact: normalizeContact(asObject(input.contact)),
    delivery: {
      status: normalizeDeliveryStatus(input?.delivery?.status),
      lastQueuedAt: asString(input?.delivery?.lastQueuedAt),
      lastSentAt: asString(input?.delivery?.lastSentAt),
      lastFailedAt: asString(input?.delivery?.lastFailedAt),
      lastJobId: asString(input?.delivery?.lastJobId),
    },
    rsvp: {
      status: normalizeRsvpStatus(input?.rsvp?.status),
      lockedAt: asString(input?.rsvp?.lockedAt),
      reopenedAt: asString(input?.rsvp?.reopenedAt),
      latestSubmissionId: asString(input?.rsvp?.latestSubmissionId),
      latestSubmittedAt: asString(input?.rsvp?.latestSubmittedAt),
      summary: normalizeRsvpSummary(input?.rsvp?.summary),
    },
    members: normalizedMembers,
    createdAt: asString(input.createdAt, now),
    updatedAt: asString(input.updatedAt, now),
  };

  if (!group.familyLabel) {
    group.familyLabel = buildFamilyLabel(group.members[0], group.invitationCode);
  }

  return group;
}

function normalizeMember(input = {}, index = 0, existing = {}) {
  return {
    id: asString(input.id, existing.id || createId("member")),
    role: asString(input.role, index === 0 ? "primary" : "plus_one"),
    firstName: asString(input.firstName, existing.firstName),
    lastNamePaternal: asString(input.lastNamePaternal, existing.lastNamePaternal),
    lastNameMaternal: asString(input.lastNameMaternal, existing.lastNameMaternal),
    displayName: asString(input.displayName, existing.displayName),
    anonymousPlusOne: Boolean(input.anonymousPlusOne),
    sortOrder: Number.isFinite(Number(input.sortOrder))
      ? Number(input.sortOrder)
      : Number.isFinite(Number(existing.sortOrder))
        ? Number(existing.sortOrder)
        : index,
  };
}

function normalizeRsvpSummary(summary) {
  if (!summary || typeof summary !== "object") return null;
  const guests = Array.isArray(summary.guests)
    ? summary.guests.map((guest) => ({
        memberId: asString(guest.memberId),
        displayName: asString(guest.displayName),
        attendance: guest.attendance === "yes" ? "yes" : "no",
        dietaryRestriction: asString(guest.dietaryRestriction),
      }))
    : [];

  return {
    attendingCount: Math.max(Number(summary.attendingCount) || 0, 0),
    declinedCount: Math.max(Number(summary.declinedCount) || 0, 0),
    respondedCount: Math.max(Number(summary.respondedCount) || guests.length, 0),
    note: asString(summary.note),
    guests,
  };
}

function decoratePortal(portal, { baseUrl, jobs = [] } = {}) {
  const groups = portal.groups.map((group) => decorateGroup(group, { baseUrl }));
  const metrics = buildMetrics(groups, portal.totalCapacity);

  return {
    portal: {
      version: portal.version,
      eventCodePrefix: portal.eventCodePrefix,
      nextInvitationSequence: portal.nextInvitationSequence,
      totalCapacity: portal.totalCapacity,
    },
    metrics,
    groups,
    jobs,
  };
}

function decorateGroup(group, { baseUrl } = {}) {
  const normalized = normalizeGroupRecord(group);
  const invitePath = normalized.publicToken ? buildInvitePath(normalized.publicToken) : "";
  const inviteUrl = buildInviteUrl(baseUrl, invitePath);
  const summary = normalized.rsvp.summary;
  const guestCount = normalized.members.length;
  const confirmedCount = summary?.attendingCount || 0;
  const declinedCount = summary?.declinedCount || 0;

  return {
    ...normalized,
    invitePath,
    inviteUrl,
    guestCount,
    confirmedCount,
    declinedCount,
    displayStatus: deriveDisplayStatus(normalized),
    displayStatusLabel: mapDisplayStatusLabel(deriveDisplayStatus(normalized)),
    phoneDisplay: normalized.contact.phoneE164,
    primaryMember: normalized.members[0],
  };
}

function buildMetrics(groups, totalCapacity) {
  const totalGuests = groups.reduce((sum, group) => sum + group.guestCount, 0);
  const invitationsSent = groups.filter((group) => group.delivery.lastSentAt).length;
  const pendingSend = groups.filter((group) => !group.delivery.lastSentAt).length;
  const confirmedGuests = groups.reduce((sum, group) => sum + group.confirmedCount, 0);
  const notConfirmedGuests = Math.max(totalGuests - confirmedGuests, 0);

  return {
    totalGuests,
    invitationsSent,
    pendingSend,
    confirmedGuests,
    notConfirmedGuests,
    availableSeats:
      totalCapacity > 0 ? Math.max(Number(totalCapacity) - confirmedGuests, 0) : null,
  };
}

function buildMemberDisplayName(member, anonymousIndex = 0) {
  if (member.anonymousPlusOne) {
    return `Invitado adicional ${anonymousIndex || 1}`;
  }

  const fullName = [member.firstName, member.lastNamePaternal, member.lastNameMaternal]
    .map((part) => asString(part))
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) return fullName;
  return member.role === "primary" ? "Invitado principal" : "Acompanante";
}

function buildFamilyLabel(primaryMember, invitationCode) {
  const paternal = asString(primaryMember?.lastNamePaternal);
  const maternal = asString(primaryMember?.lastNameMaternal);
  const familyName = [paternal, maternal].filter(Boolean).join(" ").trim();

  if (familyName) {
    return `Familia ${familyName}`;
  }

  return primaryMember?.displayName || `Grupo ${invitationCode}`;
}

function buildRsvpSummary(guests, note) {
  const attendingCount = guests.filter((guest) => guest.attendance === "yes").length;
  const declinedCount = guests.filter((guest) => guest.attendance === "no").length;

  return {
    attendingCount,
    declinedCount,
    respondedCount: guests.length,
    note: asString(note),
    guests,
  };
}

function normalizeSubmittedGuests(input, members) {
  const submitted = Array.isArray(input) ? input : [];

  if (submitted.length !== members.length) {
    throw createStoreError(
      "invite_payload_invalid",
      "La respuesta debe incluir una decision para cada integrante."
    );
  }

  return members.map((member) => {
    const found = submitted.find((guest) => guest.memberId === member.id);
    if (!found) {
      throw createStoreError(
        "invite_payload_invalid",
        "Falta la respuesta de uno o mas integrantes del grupo."
      );
    }

    const attendance = found.attendance === "yes" ? "yes" : found.attendance === "no" ? "no" : "";
    if (!attendance) {
      throw createStoreError(
        "invite_payload_invalid",
        "Cada integrante debe confirmar si asiste o no asiste."
      );
    }

    return {
      memberId: member.id,
      displayName: member.displayName,
      attendance,
      dietaryRestriction: attendance === "yes" ? asString(found.dietaryRestriction) : "",
    };
  });
}

function deriveDisplayStatus(group) {
  if (group.rsvp.lockedAt) {
    return (group.rsvp.summary?.attendingCount || 0) > 0 ? "confirmed" : "declined";
  }

  if (group.delivery.status === "sent") return "sent";
  if (group.delivery.status === "queued") return "queued";
  if (group.delivery.status === "failed") return "failed";
  return "not_sent";
}

function mapDisplayStatusLabel(status) {
  if (status === "confirmed") return "Confirmado";
  if (status === "declined") return "No asiste";
  if (status === "sent") return "Enviado";
  if (status === "queued") return "En cola";
  if (status === "failed") return "Envio con error";
  return "No enviado";
}

function mapAttendanceLabel(attendance) {
  if (attendance === "yes") return "Asiste";
  if (attendance === "no") return "No asiste";
  return "";
}

function normalizeDeliveryStatus(status) {
  return ["not_sent", "queued", "sent", "failed"].includes(status) ? status : "not_sent";
}

function normalizeRsvpStatus(status) {
  return ["pending", "confirmed", "declined"].includes(status) ? status : "pending";
}

function normalizeContact(input = {}) {
  const countryCode = normalizeCountryCode(input.countryCode);
  const phoneNumber = normalizePhoneNumber(input.phoneNumber);
  const phoneE164 = countryCode && phoneNumber ? `${countryCode}${phoneNumber}` : "";

  return {
    countryCode,
    phoneNumber,
    phoneE164,
  };
}

function normalizeCountryCode(value) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  if (!digits) return "";
  const cleaned = digits.startsWith("+") ? digits : `+${digits.replaceAll("+", "")}`;
  return `+${cleaned.replace(/[^\d]/g, "")}`;
}

function normalizePhoneNumber(value) {
  return String(value || "").replace(/\D+/g, "");
}

function normalizeCapacity(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
}

function findGroup(portal, groupId) {
  const group = portal.groups.find((item) => item.id === groupId);
  if (!group) {
    throw createStoreError("guest_group_not_found", "No se encontro el grupo solicitado.");
  }
  return group;
}

function validateImportHeaders(headers) {
  const required = [
    "group_key",
    "is_primary",
    "is_anonymous_plus_one",
    "first_name",
    "last_name_paternal",
    "last_name_maternal",
    "family_label",
    "country_code",
    "phone_number",
  ];

  for (const header of required) {
    if (!headers.includes(header)) {
      throw createStoreError(
        "csv_header_invalid",
        `Falta la columna requerida "${header}" dentro del CSV.`
      );
    }
  }
}

function parseLegacyName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return {
      firstName: "",
      lastNamePaternal: "",
      lastNameMaternal: "",
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastNamePaternal: "",
      lastNameMaternal: "",
    };
  }

  if (parts.length === 2) {
    return {
      firstName: parts[0],
      lastNamePaternal: parts[1],
      lastNameMaternal: "",
    };
  }

  return {
    firstName: parts[0],
    lastNamePaternal: parts[1],
    lastNameMaternal: parts.slice(2).join(" "),
  };
}

function parseCsv(text = "") {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function normalizeCsvHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseBoolean(value) {
  return ["true", "1", "si", "yes", "y"].includes(String(value || "").trim().toLowerCase());
}

function findInitial(value) {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();

  return normalized.slice(0, 1);
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function buildInviteUrl(baseUrl, invitePath) {
  if (!invitePath) return "";
  if (!baseUrl) return invitePath;
  return new URL(invitePath, baseUrl).toString();
}

function createStoreError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

async function writeAtomicJson(filePath, value) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, serialized, "utf8");
  try {
    await fs.rename(tempPath, filePath);
  } catch (error) {
    if (!error || error.code !== "EPERM") {
      throw error;
    }
    await fs.writeFile(filePath, serialized, "utf8");
  }
}

async function appendNdjson(filePath, value) {
  await fs.appendFile(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

async function readNdjson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function asString(value, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
