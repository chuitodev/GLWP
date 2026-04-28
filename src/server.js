import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createConfigStore } from "./lib/config-store.js";
import { createGuestPortalStore } from "./lib/guest-store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const STORAGE_DIR = path.join(ROOT_DIR, "storage");
const DATA_DIR = path.join(STORAGE_DIR, "data");
const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");

await loadLocalEnv(path.join(ROOT_DIR, ".env"));
const PORT = Number(process.env.PORT || 8080);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const configStore = createConfigStore({ dataDir: DATA_DIR });
const guestStore = createGuestPortalStore({
  dataDir: DATA_DIR,
  loadConfig: () => configStore.load(),
});

await Promise.all([configStore.ensure(), guestStore.ensure()]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const STATIC_FILE_MAP = {
  "/": path.join(PUBLIC_DIR, "index.html"),
  "/index.html": path.join(PUBLIC_DIR, "index.html"),
  "/styles.css": path.join(PUBLIC_DIR, "styles.css"),
  "/main.js": path.join(PUBLIC_DIR, "main.js"),
  "/admin.css": path.join(PUBLIC_DIR, "admin.css"),
  "/admin.js": path.join(PUBLIC_DIR, "admin.js"),
  "/admin-invitation.css": path.join(PUBLIC_DIR, "admin-invitation.css"),
  "/admin-invitation.js": path.join(PUBLIC_DIR, "admin-invitation.js"),
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    const baseUrl = getRequestBaseUrl(req);

    const groupMatch = pathname.match(/^\/api\/admin\/invitations\/([^/]+)$/);
    const membersMatch = pathname.match(/^\/api\/admin\/invitations\/([^/]+)\/members$/);
    const memberMatch = pathname.match(/^\/api\/admin\/invitations\/([^/]+)\/members\/([^/]+)$/);
    const sendMatch = pathname.match(/^\/api\/admin\/invitations\/([^/]+)\/send$/);
    const reopenMatch = pathname.match(/^\/api\/admin\/invitations\/([^/]+)\/reopen-rsvp$/);
    const sendJobMatch = pathname.match(/^\/api\/admin\/send-jobs\/([^/]+)\/mark-(sent|failed)$/);
    const inviteMatch = pathname.match(/^\/api\/invite\/([^/]+)$/);
    const inviteRsvpMatch = pathname.match(/^\/api\/invite\/([^/]+)\/rsvp$/);

    if (pathname === "/api/config" && req.method === "GET") {
      const config = await configStore.load();
      return sendJson(res, 200, buildPublicConfig(config));
    }

    if (pathname === "/api/admin/config" && req.method === "GET") {
      if (!authorizeAdmin(req, res)) return;
      return sendJson(res, 200, await configStore.load());
    }

    if (pathname === "/api/admin/config" && req.method === "PUT") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const config = await configStore.save(body);
      return sendJson(res, 200, {
        ok: true,
        message: "Configuracion guardada correctamente.",
        config,
      });
    }

    if (pathname === "/api/admin/seed" && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const config = await configStore.resetFromSeed();
      return sendJson(res, 200, {
        ok: true,
        message: "Configuracion restaurada desde la semilla inicial.",
        config,
      });
    }

    if (pathname === "/api/admin/meta" && req.method === "GET") {
      if (!authorizeAdmin(req, res)) return;
      return sendJson(res, 200, {
        storage: {
          configPath: configStore.configPath,
          uploadsPath: UPLOADS_DIR,
          dataPath: DATA_DIR,
          guestPortalPath: guestStore.portalPath,
          guestRsvpHistoryPath: guestStore.rsvpHistoryPath,
          guestSendJobsPath: guestStore.sendJobsPath,
        },
        authEnabled: Boolean(ADMIN_USERNAME && ADMIN_PASSWORD),
      });
    }

    if (pathname === "/api/admin/upload" && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const uploaded = await persistUpload(req);
      return sendJson(res, 200, {
        ok: true,
        message: "Imagen subida correctamente.",
        file: uploaded,
      });
    }

    if (pathname === "/api/admin/invitations" && req.method === "GET") {
      if (!authorizeAdmin(req, res)) return;
      return sendJson(res, 200, await guestStore.getAdminSnapshot({ baseUrl }));
    }

    if (pathname === "/api/admin/invitations" && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const group = await guestStore.createGroup(body);
      return sendJson(res, 201, {
        ok: true,
        message: "Invitacion creada correctamente.",
        group,
      });
    }

    if (pathname === "/api/admin/invitations/meta" && req.method === "PATCH") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const snapshot = await guestStore.updateMeta(body);
      return sendJson(res, 200, {
        ok: true,
        message: "Capacidad total actualizada.",
        portal: snapshot,
      });
    }

    if (pathname === "/api/admin/invitations/template.csv" && req.method === "GET") {
      if (!authorizeAdmin(req, res)) return;
      return sendText(res, 200, guestStore.getTemplateCsv(), "text/csv; charset=utf-8", {
        "Content-Disposition": 'attachment; filename="guest-template.csv"',
      });
    }

    if (pathname === "/api/admin/invitations/import" && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const result = await guestStore.importCsv(body.csvText || "");
      return sendJson(res, 201, {
        ok: true,
        message: "Invitados importados correctamente.",
        ...result,
      });
    }

    if (pathname === "/api/admin/invitations/export.xlsx" && req.method === "GET") {
      if (!authorizeAdmin(req, res)) return;
      const buffer = await guestStore.exportWorkbook({ baseUrl });
      return sendBuffer(
        res,
        200,
        buffer,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        {
          "Content-Disposition": 'attachment; filename="guest-list.xlsx"',
        }
      );
    }

    if (pathname === "/api/admin/invitations/send-bulk" && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const result = await guestStore.queueSendBulk(body.groupIds, { baseUrl });
      return sendJson(res, 200, {
        ok: true,
        message: "Envios agregados a la cola tecnica.",
        ...result,
      });
    }

    if (pathname === "/api/admin/send-jobs" && req.method === "GET") {
      if (!authorizeAdmin(req, res)) return;
      return sendJson(res, 200, {
        jobs: await guestStore.listSendJobs({ baseUrl }),
      });
    }

    if (groupMatch && req.method === "PATCH") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const group = await guestStore.updateGroup(groupMatch[1], body);
      return sendJson(res, 200, {
        ok: true,
        message: "Invitacion actualizada correctamente.",
        group,
      });
    }

    if (groupMatch && req.method === "DELETE") {
      if (!authorizeAdmin(req, res)) return;
      const result = await guestStore.deleteGroup(groupMatch[1]);
      return sendJson(res, 200, {
        ok: true,
        message: "Invitacion eliminada correctamente.",
        ...result,
      });
    }

    if (membersMatch && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const group = await guestStore.addMember(membersMatch[1], body);
      return sendJson(res, 201, {
        ok: true,
        message: "Integrante agregado correctamente.",
        group,
      });
    }

    if (memberMatch && req.method === "PATCH") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const group = await guestStore.updateMember(memberMatch[1], memberMatch[2], body);
      return sendJson(res, 200, {
        ok: true,
        message: "Integrante actualizado correctamente.",
        group,
      });
    }

    if (memberMatch && req.method === "DELETE") {
      if (!authorizeAdmin(req, res)) return;
      const group = await guestStore.removeMember(memberMatch[1], memberMatch[2]);
      return sendJson(res, 200, {
        ok: true,
        message: "Integrante eliminado correctamente.",
        group,
      });
    }

    if (sendMatch && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const result = await guestStore.queueSend(sendMatch[1], { baseUrl });
      return sendJson(res, 200, {
        ok: true,
        message: "Invitacion agregada a la cola tecnica de envio.",
        ...result,
      });
    }

    if (reopenMatch && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const result = await guestStore.reopenRsvp(reopenMatch[1]);
      return sendJson(res, 200, {
        ok: true,
        message: "RSVP reabierto correctamente.",
        ...result,
      });
    }

    if (sendJobMatch && req.method === "POST") {
      if (!authorizeAdmin(req, res)) return;
      const body = await readJsonBody(req).catch(() => ({}));
      const result = await guestStore.markSendJob(sendJobMatch[1], sendJobMatch[2], body);
      return sendJson(res, 200, {
        ok: true,
        message:
          sendJobMatch[2] === "sent"
            ? "Envio marcado como enviado."
            : "Envio marcado como fallido.",
        ...result,
      });
    }

    if (inviteMatch && req.method === "GET") {
      const config = buildPublicConfig(await configStore.load());
      const invitation = await guestStore.getInvite(inviteMatch[1], { baseUrl });
      return sendJson(res, 200, {
        config,
        invitation,
      });
    }

    if (inviteRsvpMatch && req.method === "POST") {
      const body = await readJsonBody(req);
      const result = await guestStore.submitInviteResponse(inviteRsvpMatch[1], body);
      return sendJson(res, 200, result);
    }

    if (pathname === "/api/rsvp" && req.method === "POST") {
      const body = await readJsonBody(req);
      const result = await persistRsvp(body);
      return sendJson(res, 200, result);
    }

    if (pathname.startsWith("/uploads/")) {
      return serveStaticFile(res, safeJoin(UPLOADS_DIR, pathname.replace("/uploads/", "")));
    }

    if (pathname === "/admin" || pathname === "/admin.html") {
      if (!authorizeAdmin(req, res)) return;
      return serveStaticFile(res, path.join(PUBLIC_DIR, "admin.html"));
    }

    if (pathname === "/admin/invitation") {
      if (!authorizeAdmin(req, res)) return;
      return serveStaticFile(res, path.join(PUBLIC_DIR, "admin-invitation.html"));
    }

    if (pathname.startsWith("/invite/") && req.method === "GET") {
      return serveStaticFile(res, path.join(PUBLIC_DIR, "invite.html"));
    }

    if (STATIC_FILE_MAP[pathname]) {
      return serveStaticFile(res, STATIC_FILE_MAP[pathname]);
    }

    return serveStaticFile(res, path.join(PUBLIC_DIR, "index.html"));
  } catch (error) {
    console.error(error);
    return sendKnownError(res, error);
  }
});

server.listen(PORT, () => {
  console.log(`GLWP invitation listening on http://localhost:${PORT}`);
});

async function loadLocalEnv(envPath) {
  try {
    const content = await fs.readFile(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    return;
  }
}

function buildPublicConfig(config) {
  return {
    ...config,
    couple: {
      ...config.couple,
      display:
        config.couple.display ||
        [config.couple.bride, config.couple.groom].filter(Boolean).join(" & "),
    },
    hero: {
      ...config.hero,
      cards: config.timeline.items.slice(0, 3),
    },
  };
}

function getRequestBaseUrl(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${req.headers.host}`;
}

function authorizeAdmin(req, res) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return true;
  }

  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) {
    return requestAdminAuth(res);
  }

  const credentials = Buffer.from(header.slice(6), "base64").toString("utf8");
  const separatorIndex = credentials.indexOf(":");
  const username = separatorIndex === -1 ? credentials : credentials.slice(0, separatorIndex);
  const password = separatorIndex === -1 ? "" : credentials.slice(separatorIndex + 1);

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return requestAdminAuth(res);
  }

  return true;
}

function requestAdminAuth(res) {
  res.writeHead(401, {
    "Content-Type": "application/json; charset=utf-8",
    "WWW-Authenticate": 'Basic realm="GLWP Admin"',
  });
  res.end(
    JSON.stringify({
      error: "admin_auth_required",
      message: "Credenciales de administrador requeridas.",
    })
  );
  return false;
}

async function persistRsvp(payload) {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const safePayload = {
    groupName: payload.groupName || "Grupo sin nombre",
    submittedAt: new Date().toISOString(),
    guests: Array.isArray(payload.guests) ? payload.guests : [],
    note: payload.note || "",
  };

  const ndjsonPath = path.join(DATA_DIR, "rsvp-submissions.ndjson");
  const txtPath = path.join(DATA_DIR, "rsvp-submissions.txt");

  await fs.appendFile(ndjsonPath, `${JSON.stringify(safePayload)}\n`, "utf8");

  const textBlock = [
    "========================================",
    `Fecha: ${safePayload.submittedAt}`,
    `Grupo: ${safePayload.groupName}`,
    ...safePayload.guests.map(
      (guest) =>
        `- ${guest.name}: ${guest.attendance === "yes" ? "Asistira" : "No asistira"}${
          guest.attendance === "yes"
            ? ` | Restriccion: ${guest.dietaryRestriction || guest.meal || "Sin definir"}`
            : ""
        }`
    ),
    safePayload.note ? `Nota: ${safePayload.note}` : "",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  await fs.appendFile(txtPath, `${textBlock}\n`, "utf8");

  return {
    ok: true,
    message: "RSVP guardado correctamente.",
    file: "/storage/data/rsvp-submissions.txt",
  };
}

async function persistUpload(req) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!contentType.startsWith("multipart/form-data") || !boundaryMatch) {
    throw new Error("Solicitud de subida invalida.");
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const body = await readRequestBuffer(req);
  const filePart = parseMultipartFile(body, boundary);

  if (!filePart || !filePart.filename || !filePart.data?.length) {
    throw new Error("No se encontro ningun archivo en la subida.");
  }

  if (!isAllowedUploadType(filePart.contentType, filePart.filename)) {
    throw new Error("Solo se permiten imagenes jpg, png, webp, gif o svg.");
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const safeName = sanitizeFilename(filePart.filename);
  const ext = path.extname(safeName) || extensionFromMime(filePart.contentType) || ".bin";
  const base = path.basename(safeName, path.extname(safeName)).slice(0, 60) || "upload";
  const finalName = `${Date.now()}-${base}${ext}`;
  const finalPath = path.join(UPLOADS_DIR, finalName);

  await fs.writeFile(finalPath, filePart.data);

  return {
    filename: finalName,
    url: `/uploads/${finalName}`,
    contentType: filePart.contentType || "application/octet-stream",
    size: filePart.data.length,
  };
}

async function readJsonBody(req) {
  const raw = await readRequestText(req);
  return JSON.parse(raw || "{}");
}

async function readRequestText(req) {
  return (await readRequestBuffer(req)).toString("utf8");
}

async function readRequestBuffer(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function parseMultipartFile(body, boundary) {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const sections = [];
  let start = body.indexOf(boundaryBuffer);

  while (start !== -1) {
    const next = body.indexOf(boundaryBuffer, start + boundaryBuffer.length);
    if (next === -1) break;
    sections.push(body.subarray(start + boundaryBuffer.length, next));
    start = next;
  }

  for (const section of sections) {
    const normalized = trimMultipartSection(section);
    if (!normalized.length || normalized.equals(Buffer.from("--"))) continue;

    const headerEnd = normalized.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) continue;

    const headerText = normalized.subarray(0, headerEnd).toString("utf8");
    const content = normalized.subarray(headerEnd + 4);
    const disposition = headerText.match(/name="([^"]+)"/i);
    const filename = headerText.match(/filename="([^"]*)"/i);
    const contentType = headerText.match(/content-type:\s*([^\r\n]+)/i);

    if (disposition?.[1] !== "file" || !filename?.[1]) continue;

    return {
      filename: filename[1],
      contentType: contentType?.[1]?.trim() || "",
      data: trimMultipartSection(content),
    };
  }

  return null;
}

function trimMultipartSection(buffer) {
  let start = 0;
  let end = buffer.length;

  while (start < end && (buffer[start] === 13 || buffer[start] === 10)) start += 1;
  while (
    end > start &&
    (buffer[end - 1] === 13 || buffer[end - 1] === 10 || buffer[end - 1] === 45)
  ) {
    end -= 1;
  }

  return buffer.subarray(start, end);
}

function isAllowedUploadType(contentType, filename) {
  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ]);

  if (allowed.has((contentType || "").toLowerCase())) {
    return true;
  }

  return [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(
    path.extname(filename || "").toLowerCase()
  );
}

function sanitizeFilename(filename) {
  return String(filename || "")
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function extensionFromMime(contentType) {
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return map[(contentType || "").toLowerCase()] || "";
}

async function serveStaticFile(res, filePath) {
  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const cacheControl =
      extension === ".html" || extension === ".js" || extension === ".css"
        ? "no-store, no-cache, must-revalidate"
        : "public, max-age=300";

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": cacheControl,
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload, contentType = "text/plain; charset=utf-8", headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    ...headers,
  });
  res.end(payload);
}

function sendBuffer(res, statusCode, payload, contentType, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": payload.length,
    ...headers,
  });
  res.end(payload);
}

function sendKnownError(res, error) {
  if (
    error?.code === "invite_not_found" ||
    error?.code === "guest_group_not_found" ||
    error?.code === "guest_member_not_found" ||
    error?.code === "send_job_not_found"
  ) {
    return sendJson(res, 404, {
      error: error.code,
      message: error.message,
    });
  }

  if (
    error?.code === "invite_locked" ||
    error?.code === "csv_header_invalid" ||
    error?.code === "csv_empty" ||
    error?.code === "csv_primary_invalid" ||
    error?.code === "guest_member_required" ||
    error?.code === "invite_payload_invalid"
  ) {
    const statusCode = error.code === "invite_locked" ? 409 : 400;
    return sendJson(res, statusCode, {
      error: error.code,
      message: error.message,
    });
  }

  if (error instanceof SyntaxError) {
    return sendJson(res, 400, {
      error: "invalid_json",
      message: "El cuerpo JSON de la solicitud no es valido.",
    });
  }

  return sendJson(res, 500, {
    error: "internal_server_error",
    message: "No fue posible procesar la solicitud.",
  });
}

function safeJoin(basePath, relativePath) {
  const resolved = path.resolve(basePath, relativePath);
  if (!resolved.startsWith(basePath)) {
    throw new Error("Invalid path");
  }
  return resolved;
}
