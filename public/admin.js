const state = {
  view: "guests",
  loading: false,
  filtersOpen: false,
  snapshot: null,
  selectedGroupIds: new Set(),
  dialogs: {
    group: { mode: "create", groupId: "" },
    member: { mode: "create", groupId: "", memberId: "" },
  },
};

const statusNode = document.querySelector("#admin-status");
const refreshButton = document.querySelector("#refresh-admin");
const tabs = [...document.querySelectorAll("[data-view-tab]")];
const views = [...document.querySelectorAll("[data-view]")];
const metricsGrid = document.querySelector("#metrics-grid");
const guestTable = document.querySelector("#guest-table");
const jobList = document.querySelector("#job-list");
const selectionSummary = document.querySelector("#selection-summary");
const tableMeta = document.querySelector("#table-meta");
const filtersPanel = document.querySelector("#filters-panel");
const capacityInput = document.querySelector("#total-capacity");
const saveCapacityButton = document.querySelector("#save-capacity");
const csvInput = document.querySelector("#csv-input");
const detailContent = document.querySelector("#detail-content");

const groupDialog = document.querySelector("#group-dialog");
const groupForm = document.querySelector("#group-form");
const groupDialogTitle = document.querySelector("#group-dialog-title");
const groupFamilyLabelInput = document.querySelector("#group-family-label");
const groupCountryCodeInput = document.querySelector("#group-country-code");
const groupPhoneNumberInput = document.querySelector("#group-phone-number");
const groupPhoneE164Input = document.querySelector("#group-phone-e164");
const groupPrimaryFirstNameInput = document.querySelector("#group-primary-first-name");
const groupPrimaryLastNameInput = document.querySelector("#group-primary-lastname");
const groupPrimarySecondLastNameInput = document.querySelector("#group-primary-second-lastname");

const memberDialog = document.querySelector("#member-dialog");
const memberForm = document.querySelector("#member-form");
const memberDialogTitle = document.querySelector("#member-dialog-title");
const memberAnonymousInput = document.querySelector("#member-anonymous");
const memberFirstNameInput = document.querySelector("#member-first-name");
const memberLastNameInput = document.querySelector("#member-lastname");
const memberSecondLastNameInput = document.querySelector("#member-second-lastname");

const detailDialog = document.querySelector("#detail-dialog");

const filterControls = {
  query: document.querySelector("#filter-query"),
  status: document.querySelector("#filter-status"),
  lastname: document.querySelector("#filter-lastname"),
  family: document.querySelector("#filter-family"),
  code: document.querySelector("#filter-code"),
};

bootstrap();

async function bootstrap() {
  bindEvents();
  await loadSnapshot();
}

function bindEvents() {
  refreshButton?.addEventListener("click", () => {
    loadSnapshot("Portal actualizado correctamente.", "success");
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setView(tab.dataset.viewTab || "guests");
    });
  });

  document.querySelector("#toggle-filters")?.addEventListener("click", () => {
    state.filtersOpen = !state.filtersOpen;
    renderFilters();
  });

  document.querySelector("#add-group")?.addEventListener("click", () => {
    openGroupDialog();
  });

  document.querySelector("#import-csv")?.addEventListener("click", () => {
    csvInput?.click();
  });

  csvInput?.addEventListener("change", handleCsvImport);

  document.querySelector("#send-selected")?.addEventListener("click", async () => {
    const groupIds = [...state.selectedGroupIds];
    if (!groupIds.length) {
      setStatus("Selecciona al menos una invitacion antes de enviar.", "error");
      return;
    }

    try {
      setStatus("Agregando envios a la cola tecnica...");
      await apiRequest("/api/admin/invitations/send-bulk", {
        method: "POST",
        body: JSON.stringify({ groupIds }),
      });
      state.selectedGroupIds.clear();
      await loadSnapshot("Invitaciones agregadas a la cola tecnica.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  saveCapacityButton?.addEventListener("click", saveCapacity);

  Object.values(filterControls).forEach((input) => {
    input?.addEventListener("input", renderGuestsView);
    input?.addEventListener("change", renderGuestsView);
  });

  guestTable?.addEventListener("click", handleGuestTableClick);
  guestTable?.addEventListener("change", handleGuestTableChange);
  jobList?.addEventListener("click", handleJobListClick);

  groupCountryCodeInput?.addEventListener("input", syncDerivedPhone);
  groupPhoneNumberInput?.addEventListener("input", syncDerivedPhone);

  groupForm?.addEventListener("submit", handleGroupSave);
  memberForm?.addEventListener("submit", handleMemberSave);
  memberAnonymousInput?.addEventListener("change", syncMemberAnonymousState);

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.closeDialog || "");
      dialog?.close();
    });
  });
}

async function loadSnapshot(message = "Portal listo para trabajar.", variant = "") {
  state.loading = true;
  setStatus("Cargando portal de invitados...");

  try {
    const snapshot = await apiRequest("/api/admin/invitations");
    state.snapshot = snapshot;
    syncCapacityField();
    syncSelectionWithSnapshot();
    render();
    setStatus(message, variant);
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    state.loading = false;
  }
}

function render() {
  setView(state.view, { silent: true });
  renderFilters();
  renderGuestsView();
}

function setView(view, options = {}) {
  state.view = view;
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.viewTab === view);
  });
  views.forEach((section) => {
    section.classList.toggle("is-active", section.dataset.view === view);
  });

  if (!options.silent && view === "invitation") {
    setStatus("La vista Invitacion conserva el editor completo del micrositio.", "success");
  }
}

function renderFilters() {
  filtersPanel?.classList.toggle("is-open", state.filtersOpen);
}

function renderGuestsView() {
  renderMetrics();
  renderSelectionSummary();
  renderTable();
  renderJobs();
}

function renderMetrics() {
  const metrics = state.snapshot?.metrics;
  if (!metrics || !metricsGrid) {
    metricsGrid.innerHTML = "";
    return;
  }

  const cards = [
    { value: metrics.totalGuests, label: "Total de invitados" },
    { value: metrics.invitationsSent, label: "Invitaciones enviadas" },
    { value: metrics.pendingSend, label: "Pendientes de enviar" },
    { value: metrics.confirmedGuests, label: "Invitados confirmados" },
    { value: metrics.notConfirmedGuests, label: "Invitados no confirmados" },
    {
      value: metrics.availableSeats === null ? "N/D" : metrics.availableSeats,
      label: "Lugares disponibles",
    },
  ];

  metricsGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card">
          <strong>${escapeHtml(card.value)}</strong>
          <span>${escapeHtml(card.label)}</span>
          <small>Conteo persistente por integrante real o plus one anonimo.</small>
        </article>
      `
    )
    .join("");
}

function renderSelectionSummary() {
  const groups = getFilteredGroups();
  const selectedGroups = groups.filter((group) => state.selectedGroupIds.has(group.id));
  const selectedGuests = selectedGroups.reduce((sum, group) => sum + group.guestCount, 0);

  selectionSummary.textContent = selectedGroups.length
    ? `${selectedGroups.length} invitaciones seleccionadas | ${selectedGuests} invitados dentro de la seleccion.`
    : "Ninguna invitacion seleccionada.";
}

function renderTable() {
  const groups = getFilteredGroups();
  if (tableMeta) {
    const total = state.snapshot?.groups?.length || 0;
    tableMeta.textContent = `${groups.length} visibles de ${total} invitaciones registradas.`;
  }

  if (!groups.length) {
    guestTable.innerHTML = `
      <div class="empty-state">
        No hay invitaciones que coincidan con los filtros actuales.
      </div>
    `;
    return;
  }

  guestTable.innerHTML = `
    <table class="guest-table">
      <thead>
        <tr>
          <th></th>
          <th>#</th>
          <th>Nombre(s)</th>
          <th>Apellidos</th>
          <th>Telefono</th>
          <th>Estado</th>
          <th>Accion</th>
        </tr>
      </thead>
      <tbody>
        ${groups.map((group) => renderGroupRows(group)).join("")}
      </tbody>
    </table>
  `;
}

function renderGroupRows(group) {
  const primary = group.primaryMember;
  const memberRows = group.members
    .slice(1)
    .map(
      (member) => `
        <tr class="guest-table__member">
          <td></td>
          <td></td>
          <td>
            <div class="guest-person guest-person--member">
              <strong>${escapeHtml(member.displayName)}</strong>
              <small>${member.anonymousPlusOne ? "Plus one anonimo" : "Acompanante"}</small>
            </div>
          </td>
          <td>${escapeHtml(joinSurnames(member))}</td>
          <td></td>
          <td></td>
          <td>
            <div class="table-actions">
              <button class="button button--secondary" type="button" data-edit-member="${escapeHtml(
                member.id
              )}" data-group-id="${escapeHtml(group.id)}">Editar</button>
              <button class="button button--secondary" type="button" data-delete-member="${escapeHtml(
                member.id
              )}" data-group-id="${escapeHtml(group.id)}">Eliminar</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <tr class="guest-table__group">
      <td>
        <input type="checkbox" data-select-group="${escapeHtml(group.id)}" ${
          state.selectedGroupIds.has(group.id) ? "checked" : ""
        } />
      </td>
      <td><span class="guest-code">${escapeHtml(group.invitationCode)}</span></td>
      <td>
        <div class="guest-person">
          <strong>${escapeHtml(primary.displayName)}</strong>
          <small>${escapeHtml(group.familyLabel)}</small>
        </div>
      </td>
      <td>${escapeHtml(joinSurnames(primary))}</td>
      <td>
        <div class="phone-stack">
          <strong>${escapeHtml(group.contact.phoneE164 || "Sin telefono")}</strong>
          <small>${escapeHtml(renderPhoneParts(group.contact))}</small>
        </div>
      </td>
      <td>${renderStatusPill(group)}</td>
      <td>
        <div class="table-actions">
          <button class="button button--secondary" type="button" data-send-group="${escapeHtml(
            group.id
          )}">
            ${group.delivery.lastSentAt ? "Reenviar" : "Enviar"}
          </button>
          <button class="button button--secondary" type="button" data-add-member="${escapeHtml(
            group.id
          )}">
            Agregar invitado
          </button>
          <button class="button button--secondary" type="button" data-edit-group="${escapeHtml(
            group.id
          )}">
            Editar
          </button>
          <button class="button button--secondary" type="button" data-delete-group="${escapeHtml(
            group.id
          )}">
            Eliminar
          </button>
          <details class="more-actions">
            <summary class="button button--secondary more-actions__summary">Mas acciones</summary>
            <div class="more-actions__menu">
              <button class="button button--secondary" type="button" data-copy-link="${escapeHtml(
                group.id
              )}">
                Copiar enlace
              </button>
              <button class="button button--secondary" type="button" data-reopen-rsvp="${escapeHtml(
                group.id
              )}">
                Reabrir RSVP
              </button>
              <button class="button button--secondary" type="button" data-view-detail="${escapeHtml(
                group.id
              )}">
                Ver detalle
              </button>
            </div>
          </details>
        </div>
      </td>
    </tr>
    ${memberRows}
  `;
}

function renderJobs() {
  const jobs = state.snapshot?.jobs || [];
  if (!jobs.length) {
    jobList.innerHTML = `
      <div class="empty-state">
        Todavia no hay jobs en la cola tecnica.
      </div>
    `;
    return;
  }

  jobList.innerHTML = jobs
    .map(
      (job) => `
        <article class="job-card">
          <div class="job-card__head">
            <div>
              <strong>${escapeHtml(job.invitationCode || "Sin codigo")}</strong>
              <div class="job-card__meta">
                <span>${escapeHtml(job.contactName || "Sin nombre de contacto")}</span>
                <span>${escapeHtml(job.contactPhoneE164 || "Sin telefono")}</span>
                <span>${escapeHtml(job.inviteUrl || buildInvitePlaceholder(job.invitePath))}</span>
              </div>
            </div>
            ${renderJobStatus(job.status)}
          </div>
          <div class="job-card__meta">
            <span>Creado: ${escapeHtml(formatDateTime(job.createdAt))}</span>
            <span>Actualizado: ${escapeHtml(formatDateTime(job.updatedAt))}</span>
          </div>
          <div class="job-card__actions">
            ${
              job.status === "queued"
                ? `
                  <button class="button button--secondary" type="button" data-mark-job="sent" data-job-id="${escapeHtml(
                    job.jobId
                  )}">
                    Marcar enviado
                  </button>
                  <button class="button button--secondary" type="button" data-mark-job="failed" data-job-id="${escapeHtml(
                    job.jobId
                  )}">
                    Marcar fallido
                  </button>
                `
                : ""
            }
          </div>
        </article>
      `
    )
    .join("");
}

function renderJobStatus(status) {
  const label =
    status === "sent"
      ? "Enviado"
      : status === "failed"
        ? "Fallido"
        : status === "queued"
          ? "En cola"
          : status || "Pendiente";

  return `<span class="status-pill" data-status="${escapeHtml(status || "queued")}">${escapeHtml(
    label
  )}</span>`;
}

function handleGuestTableChange(event) {
  const checkbox = event.target.closest("[data-select-group]");
  if (!checkbox) return;

  const groupId = checkbox.dataset.selectGroup;
  if (!groupId) return;

  if (checkbox.checked) {
    state.selectedGroupIds.add(groupId);
  } else {
    state.selectedGroupIds.delete(groupId);
  }

  renderSelectionSummary();
}

async function handleGuestTableClick(event) {
  const target = event.target.closest("button");
  if (!target) return;

  const groupId =
    target.dataset.sendGroup ||
    target.dataset.addMember ||
    target.dataset.editGroup ||
    target.dataset.deleteGroup ||
    target.dataset.copyLink ||
    target.dataset.reopenRsvp ||
    target.dataset.viewDetail ||
    target.dataset.groupId ||
    "";

  try {
    if (target.dataset.sendGroup) {
      await queueSend(target.dataset.sendGroup);
      return;
    }

    if (target.dataset.addMember) {
      openMemberDialog(target.dataset.addMember);
      return;
    }

    if (target.dataset.editGroup) {
      openGroupDialog(target.dataset.editGroup);
      return;
    }

    if (target.dataset.deleteGroup) {
      await deleteGroup(target.dataset.deleteGroup);
      return;
    }

    if (target.dataset.editMember) {
      openMemberDialog(groupId, target.dataset.editMember);
      return;
    }

    if (target.dataset.deleteMember) {
      await deleteMember(groupId, target.dataset.deleteMember);
      return;
    }

    if (target.dataset.copyLink) {
      await copyInviteLink(target.dataset.copyLink);
      return;
    }

    if (target.dataset.reopenRsvp) {
      await reopenRsvp(target.dataset.reopenRsvp);
      return;
    }

    if (target.dataset.viewDetail) {
      openDetailDialog(target.dataset.viewDetail);
    }
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function handleJobListClick(event) {
  const button = event.target.closest("[data-mark-job]");
  if (!button) return;

  const nextStatus = button.dataset.markJob;
  const jobId = button.dataset.jobId;
  if (!nextStatus || !jobId) return;

  try {
    setStatus("Actualizando estado del job...");
    await apiRequest(`/api/admin/send-jobs/${encodeURIComponent(jobId)}/mark-${nextStatus}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    await loadSnapshot("Estado de job actualizado.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function handleCsvImport(event) {
  const file = event.currentTarget.files?.[0];
  if (!file) return;

  try {
    setStatus(`Importando ${file.name}...`);
    const csvText = await file.text();
    await apiRequest("/api/admin/invitations/import", {
      method: "POST",
      body: JSON.stringify({ csvText }),
    });
    event.currentTarget.value = "";
    await loadSnapshot("Invitados importados correctamente.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function saveCapacity() {
  try {
    setStatus("Guardando capacidad total...");
    await apiRequest("/api/admin/invitations/meta", {
      method: "PATCH",
      body: JSON.stringify({ totalCapacity: Number(capacityInput.value || 0) }),
    });
    await loadSnapshot("Capacidad total actualizada.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function syncCapacityField() {
  capacityInput.value = state.snapshot?.portal?.totalCapacity || "";
}

function syncSelectionWithSnapshot() {
  const validIds = new Set((state.snapshot?.groups || []).map((group) => group.id));
  state.selectedGroupIds = new Set(
    [...state.selectedGroupIds].filter((groupId) => validIds.has(groupId))
  );
}

function getFilteredGroups() {
  const groups = state.snapshot?.groups || [];
  const query = normalizeSearch(filterControls.query?.value);
  const status = filterControls.status?.value || "all";
  const lastname = normalizeSearch(filterControls.lastname?.value);
  const family = normalizeSearch(filterControls.family?.value);
  const code = normalizeSearch(filterControls.code?.value);

  return groups.filter((group) => {
    if (status !== "all" && group.displayStatus !== status) return false;
    if (family && !normalizeSearch(group.familyLabel).includes(family)) return false;
    if (code && !normalizeSearch(group.invitationCode).includes(code)) return false;

    if (lastname) {
      const matchesLastname = group.members.some((member) =>
        normalizeSearch([member.lastNamePaternal, member.lastNameMaternal].join(" ")).includes(
          lastname
        )
      );
      if (!matchesLastname) return false;
    }

    if (query) {
      const haystack = normalizeSearch(
        [
          group.invitationCode,
          group.familyLabel,
          group.contact.phoneE164,
          ...group.members.map((member) => member.displayName),
        ].join(" ")
      );
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

function openGroupDialog(groupId = "") {
  state.dialogs.group = {
    mode: groupId ? "edit" : "create",
    groupId,
  };

  if (!groupId) {
    groupDialogTitle.textContent = "Nueva invitacion";
    groupFamilyLabelInput.value = "";
    groupCountryCodeInput.value = "+52";
    groupPhoneNumberInput.value = "";
    groupPrimaryFirstNameInput.value = "";
    groupPrimaryLastNameInput.value = "";
    groupPrimarySecondLastNameInput.value = "";
    syncDerivedPhone();
  } else {
    const group = getGroupById(groupId);
    const primary = group.primaryMember;
    groupDialogTitle.textContent = `Editar ${group.invitationCode}`;
    groupFamilyLabelInput.value = group.familyLabel || "";
    groupCountryCodeInput.value = group.contact.countryCode || "";
    groupPhoneNumberInput.value = group.contact.phoneNumber || "";
    groupPrimaryFirstNameInput.value = primary.firstName || "";
    groupPrimaryLastNameInput.value = primary.lastNamePaternal || "";
    groupPrimarySecondLastNameInput.value = primary.lastNameMaternal || "";
    syncDerivedPhone();
  }

  groupDialog.showModal();
}

async function handleGroupSave(event) {
  event.preventDefault();
  const body = {
    familyLabel: groupFamilyLabelInput.value.trim(),
    contact: {
      countryCode: groupCountryCodeInput.value.trim(),
      phoneNumber: groupPhoneNumberInput.value.trim(),
    },
  };

  if (!groupPrimaryFirstNameInput.value.trim()) {
    setStatus("El invitado principal necesita al menos un nombre.", "error");
    return;
  }

  try {
    if (state.dialogs.group.mode === "create") {
      await apiRequest("/api/admin/invitations", {
        method: "POST",
        body: JSON.stringify({
          ...body,
          members: [
            {
              role: "primary",
              firstName: groupPrimaryFirstNameInput.value.trim(),
              lastNamePaternal: groupPrimaryLastNameInput.value.trim(),
              lastNameMaternal: groupPrimarySecondLastNameInput.value.trim(),
            },
          ],
        }),
      });
      groupDialog.close();
      await loadSnapshot("Invitacion creada correctamente.", "success");
      return;
    }

    const group = getGroupById(state.dialogs.group.groupId);
    const members = group.members.map((member, index) =>
      index === 0
        ? {
            ...member,
            firstName: groupPrimaryFirstNameInput.value.trim(),
            lastNamePaternal: groupPrimaryLastNameInput.value.trim(),
            lastNameMaternal: groupPrimarySecondLastNameInput.value.trim(),
          }
        : member
    );

    await apiRequest(`/api/admin/invitations/${encodeURIComponent(group.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...body,
        members,
      }),
    });
    groupDialog.close();
    await loadSnapshot("Invitacion actualizada correctamente.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function openMemberDialog(groupId, memberId = "") {
  state.dialogs.member = {
    mode: memberId ? "edit" : "create",
    groupId,
    memberId,
  };

  if (!memberId) {
    memberDialogTitle.textContent = "Nuevo acompanante";
    memberAnonymousInput.checked = false;
    memberFirstNameInput.value = "";
    memberLastNameInput.value = "";
    memberSecondLastNameInput.value = "";
  } else {
    const group = getGroupById(groupId);
    const member = group.members.find((item) => item.id === memberId);
    memberDialogTitle.textContent = `Editar ${member.displayName}`;
    memberAnonymousInput.checked = Boolean(member.anonymousPlusOne);
    memberFirstNameInput.value = member.firstName || "";
    memberLastNameInput.value = member.lastNamePaternal || "";
    memberSecondLastNameInput.value = member.lastNameMaternal || "";
  }

  syncMemberAnonymousState();
  memberDialog.showModal();
}

async function handleMemberSave(event) {
  event.preventDefault();
  const body = {
    anonymousPlusOne: memberAnonymousInput.checked,
    firstName: memberFirstNameInput.value.trim(),
    lastNamePaternal: memberLastNameInput.value.trim(),
    lastNameMaternal: memberSecondLastNameInput.value.trim(),
  };

  if (!body.anonymousPlusOne && !body.firstName) {
    setStatus("Un acompanante identificado necesita al menos un nombre.", "error");
    return;
  }

  try {
    if (state.dialogs.member.mode === "create") {
      await apiRequest(
        `/api/admin/invitations/${encodeURIComponent(state.dialogs.member.groupId)}/members`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
    } else {
      await apiRequest(
        `/api/admin/invitations/${encodeURIComponent(
          state.dialogs.member.groupId
        )}/members/${encodeURIComponent(state.dialogs.member.memberId)}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );
    }

    memberDialog.close();
    await loadSnapshot("Integrante guardado correctamente.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function syncMemberAnonymousState() {
  const disabled = memberAnonymousInput.checked;
  memberFirstNameInput.disabled = disabled;
  memberLastNameInput.disabled = disabled;
  memberSecondLastNameInput.disabled = disabled;

  if (disabled) {
    memberFirstNameInput.value = "";
    memberLastNameInput.value = "";
    memberSecondLastNameInput.value = "";
  }
}

function syncDerivedPhone() {
  groupPhoneE164Input.value = buildE164(groupCountryCodeInput.value, groupPhoneNumberInput.value);
}

async function queueSend(groupId) {
  setStatus("Generando enlace y payload tecnico de envio...");
  await apiRequest(`/api/admin/invitations/${encodeURIComponent(groupId)}/send`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  await loadSnapshot("Invitacion agregada a la cola tecnica.", "success");
}

async function deleteGroup(groupId) {
  const group = getGroupById(groupId);
  const accepted = window.confirm(
    `Eliminar ${group.invitationCode} quitara el grupo completo de la lista. Deseas continuar?`
  );
  if (!accepted) return;

  setStatus("Eliminando invitacion...");
  await apiRequest(`/api/admin/invitations/${encodeURIComponent(groupId)}`, {
    method: "DELETE",
  });
  state.selectedGroupIds.delete(groupId);
  await loadSnapshot("Invitacion eliminada correctamente.", "success");
}

async function deleteMember(groupId, memberId) {
  const group = getGroupById(groupId);
  const member = group.members.find((item) => item.id === memberId);
  const accepted = window.confirm(`Eliminar a ${member.displayName} del grupo ${group.invitationCode}?`);
  if (!accepted) return;

  setStatus("Eliminando integrante...");
  await apiRequest(
    `/api/admin/invitations/${encodeURIComponent(groupId)}/members/${encodeURIComponent(memberId)}`,
    {
      method: "DELETE",
    }
  );
  await loadSnapshot("Integrante eliminado correctamente.", "success");
}

async function copyInviteLink(groupId) {
  const group = getGroupById(groupId);
  let inviteUrl = group.inviteUrl;

  if (!inviteUrl) {
    setStatus("La liga aun no existe. Generando enlace tecnico...");
    const result = await apiRequest(`/api/admin/invitations/${encodeURIComponent(groupId)}/send`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    inviteUrl = result.job?.inviteUrl || "";
    await loadSnapshot("La liga se genero y quedo lista en la cola tecnica.", "success");
  }

  if (!inviteUrl) {
    throw new Error("No fue posible generar el enlace de invitacion.");
  }

  await navigator.clipboard.writeText(inviteUrl);
  setStatus("Enlace copiado al portapapeles.", "success");
}

async function reopenRsvp(groupId) {
  const accepted = window.confirm(
    "Reabrir el RSVP borrara el bloqueo actual para permitir una nueva respuesta. Deseas continuar?"
  );
  if (!accepted) return;

  setStatus("Reabriendo RSVP...");
  await apiRequest(`/api/admin/invitations/${encodeURIComponent(groupId)}/reopen-rsvp`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  await loadSnapshot("RSVP reabierto correctamente.", "success");
}

function openDetailDialog(groupId) {
  const group = getGroupById(groupId);
  detailContent.innerHTML = renderDetailMarkup(group);
  detailDialog.showModal();
}

function renderDetailMarkup(group) {
  const summaryGuests = group.rsvp.summary?.guests || [];
  const membersMarkup = group.members
    .map((member) => {
      const response = summaryGuests.find((guest) => guest.memberId === member.id);
      return `
        <div class="detail-card">
          <strong>${escapeHtml(member.displayName)}</strong>
          <div>${escapeHtml(member.anonymousPlusOne ? "Plus one anonimo" : member.role === "primary" ? "Principal" : "Acompanante")}</div>
          <div>${escapeHtml(response ? renderAttendanceSummary(response) : "Sin respuesta registrada")}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="detail-grid">
      <div class="detail-card">
        <strong>Codigo visible</strong>
        <div>${escapeHtml(group.invitationCode)}</div>
      </div>
      <div class="detail-card">
        <strong>Estado</strong>
        <div>${escapeHtml(group.displayStatusLabel)}</div>
      </div>
      <div class="detail-card">
        <strong>Familia</strong>
        <div>${escapeHtml(group.familyLabel)}</div>
      </div>
      <div class="detail-card">
        <strong>Telefono</strong>
        <div>${escapeHtml(group.contact.phoneE164 || "Sin telefono")}</div>
      </div>
      <div class="detail-card">
        <strong>Enlace</strong>
        <div>${escapeHtml(group.inviteUrl || "Sin generar")}</div>
      </div>
      <div class="detail-card">
        <strong>Ultimo RSVP</strong>
        <div>${escapeHtml(formatDateTime(group.rsvp.latestSubmittedAt) || "Sin respuesta")}</div>
      </div>
    </div>
    <div class="detail-list">
      <strong>Integrantes</strong>
      ${membersMarkup}
    </div>
  `;
}

function renderAttendanceSummary(response) {
  if (!response) return "Sin respuesta registrada";
  if (response.attendance === "no") return "No asiste";
  if (!response.dietaryRestriction) return "Asiste";
  return `Asiste | Restriccion: ${response.dietaryRestriction}`;
}

function renderStatusPill(group) {
  return `<span class="status-pill" data-status="${escapeHtml(group.displayStatus)}">${escapeHtml(
    group.displayStatusLabel
  )}</span>`;
}

function getGroupById(groupId) {
  const group = (state.snapshot?.groups || []).find((item) => item.id === groupId);
  if (!group) {
    throw new Error("No se encontro la invitacion solicitada en memoria.");
  }
  return group;
}

function buildInvitePlaceholder(invitePath) {
  if (!invitePath) return "Sin enlace";
  return `${window.location.origin}${invitePath}`;
}

function renderPhoneParts(contact) {
  if (!contact.countryCode && !contact.phoneNumber) return "Captura pendiente";
  return [contact.countryCode || "Sin lada", contact.phoneNumber || "Sin numero"].join(" ");
}

function joinSurnames(member) {
  return [member.lastNamePaternal, member.lastNameMaternal].filter(Boolean).join(" ") || "Sin apellidos";
}

function buildE164(countryCode, phoneNumber) {
  const cc = String(countryCode || "")
    .trim()
    .replace(/[^\d+]/g, "");
  const num = String(phoneNumber || "")
    .trim()
    .replace(/\D+/g, "");

  if (!cc || !num) return "";
  const normalizedCc = cc.startsWith("+") ? cc : `+${cc}`;
  return `${normalizedCc.replace(/[^\d+]/g, "")}${num}`;
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function setStatus(message, variant = "") {
  statusNode.textContent = message;
  statusNode.className = "admin-status";
  if (variant === "success") statusNode.classList.add("is-success");
  if (variant === "error") statusNode.classList.add("is-error");
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new Error(payload?.message || "No fue posible completar la solicitud.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
