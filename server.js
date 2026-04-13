import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 8080);
const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");

await loadLocalEnv(path.join(__dirname, ".env"));

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/api/config" && req.method === "GET") {
      return sendJson(res, 200, buildConfig());
    }

    if (pathname === "/api/rsvp" && req.method === "POST") {
      const body = await readJsonBody(req);
      const result = await persistRsvp(body);
      return sendJson(res, 200, result);
    }

    if (pathname.startsWith("/uploads/")) {
      return serveStaticFile(res, safeJoin(UPLOADS_DIR, pathname.replace("/uploads/", "")));
    }

    const fileMap = {
      "/": path.join(__dirname, "index.html"),
      "/index.html": path.join(__dirname, "index.html"),
      "/styles.css": path.join(__dirname, "styles.css"),
      "/main.js": path.join(__dirname, "main.js"),
    };

    if (fileMap[pathname]) {
      return serveStaticFile(res, fileMap[pathname]);
    }

    return serveStaticFile(res, path.join(__dirname, "index.html"));
  } catch (error) {
    console.error(error);
    sendJson(res, 500, {
      error: "internal_server_error",
      message: "No fue posible procesar la solicitud.",
    });
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

function buildConfig() {
  const timelineItems = parseCountedItems("TIMELINE", Number(env("TIMELINE_COUNT", "3")), (index) => ({
    id: `timeline-${index}`,
    label: env(`TIMELINE_${index}_LABEL`, ""),
    time: env(`TIMELINE_${index}_TIME`, ""),
    venue: env(`TIMELINE_${index}_VENUE`, ""),
    address: env(`TIMELINE_${index}_ADDRESS`, ""),
    mapsUrl: env(`TIMELINE_${index}_MAPS_URL`, ""),
  })).filter((item) => item.label || item.venue || item.time);

  const lodgingItems = parseCountedItems("LODGING", Number(env("LODGING_COUNT", "0")), (index) => ({
    id: `lodging-${index}`,
    minutes: env(`LODGING_${index}_MINUTES`, ""),
    name: env(`LODGING_${index}_NAME`, ""),
    address: env(`LODGING_${index}_ADDRESS`, ""),
    mapsUrl: env(`LODGING_${index}_MAPS_URL`, ""),
  })).filter((item) => item.name);

  const registryItems = parseCountedItems("REGISTRY", Number(env("REGISTRY_COUNT", "0")), (index) => ({
    id: `registry-${index}`,
    title: env(`REGISTRY_${index}_TITLE`, ""),
    description: env(`REGISTRY_${index}_DESCRIPTION`, ""),
    actionLabel: env(`REGISTRY_${index}_ACTION_LABEL`, ""),
    actionUrl: env(`REGISTRY_${index}_ACTION_URL`, ""),
    copyValue: env(`REGISTRY_${index}_COPY_VALUE`, ""),
  })).filter((item) => item.title);

  const notes = parseCountedItems("NOTE", Number(env("NOTE_COUNT", "0")), (index) =>
    env(`NOTE_${index}`, "")
  ).filter(Boolean);

  const guests = parseCountedItems("GUEST", Number(env("GUEST_COUNT", "0")), (index) => ({
    id: `guest-${index}`,
    name: env(`GUEST_${index}_NAME`, `Invitado ${index}`),
  }));

  const dressLinks = [1, 2]
    .map((index) => ({
      label: env(`DRESS_LINK_${index}_LABEL`, ""),
      url: env(`DRESS_LINK_${index}_URL`, ""),
    }))
    .filter((item) => item.label && item.url);

  const galleryPhotos = [1, 2, 3]
    .map((index) => ({
      id: `gallery-${index}`,
      src: env(`STORY_PHOTO_${index}`, ""),
      alt: env(`STORY_PHOTO_${index}_ALT`, `Foto ${index} de la historia`),
    }))
    .filter((item) => item.src);

  return {
    brandLabel: env("BRAND_LABEL", "GLWP INVITATION SYSTEM"),
    topbarActionLabel: env("TOPBAR_ACTION_LABEL", "Ir a RSVP"),
    couple: {
      bride: env("BRIDE_NAME", "Camila"),
      groom: env("GROOM_NAME", "Julian"),
      display: env("COUPLE_DISPLAY_NAME", ""),
    },
    hero: {
      eyebrow: env("HERO_EYEBROW", "Nos casamos"),
      subtitle: env(
        "HERO_SUBTITLE",
        "Una celebracion para bailar, abrazar y volver a enamorarnos de la vida juntos."
      ),
      heroPhoto: env("HERO_PHOTO", ""),
      heroPhotoAlt: env("HERO_PHOTO_ALT", "Foto principal de los novios"),
      eventDate: env("EVENT_DATE", "2026-11-21T17:00:00-06:00"),
      timezone: env("EVENT_TIMEZONE", "America/Mexico_City"),
      city: env("EVENT_CITY", "San Miguel de Allende, Guanajuato"),
      cards: timelineItems.slice(0, 3),
    },
    parents: {
      title: env("PARENTS_SECTION_TITLE", "Nuestros padres"),
      text: env("PARENTS_SECTION_TEXT", ""),
      groomTitle: env("GROOM_PARENTS_TITLE", "Padres del novio"),
      groomNames: env("GROOM_PARENTS_NAMES", ""),
      brideTitle: env("BRIDE_PARENTS_TITLE", "Padres de la novia"),
      brideNames: env("BRIDE_PARENTS_NAMES", ""),
      galleryPhotos,
    },
    timeline: {
      title: env("TIMELINE_TITLE", "Itinerario"),
      description: env(
        "TIMELINE_DESCRIPTION",
        "Cada bloque del evento se configura desde el archivo .env y se renderiza en el orden indicado."
      ),
      items: timelineItems,
    },
    dressCode: {
      title: env("DRESS_TITLE", "Dress code"),
      description: env("DRESS_DESCRIPTION", "Formal contemporaneo."),
      guidance: env(
        "DRESS_GUIDANCE",
        "Sugerimos tonos tierra, marfil, negro profundo o verdes secos. Evitar blanco pleno."
      ),
      palette: env("DRESS_PALETTE", "#4f3b34,#d6b9a5,#7a8b6e,#1e1c1b,#b4664a")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      links: dressLinks,
    },
    lodging: {
      title: env("LODGING_TITLE", "Hospedaje"),
      description: env(
        "LODGING_DESCRIPTION",
        "Agrega, quita o reordena estas opciones editando el bloque de hospedaje en el .env."
      ),
      items: lodgingItems,
    },
    registry: {
      title: env("REGISTRY_TITLE", "Mesa de regalos"),
      description: env(
        "REGISTRY_DESCRIPTION",
        "Cada item puede ser solo informativo, abrir un enlace o copiar un dato."
      ),
      items: registryItems,
    },
    notes: {
      title: env("NOTES_TITLE", "Indicaciones finales"),
      items: notes,
    },
    rsvp: {
      title: env("RSVP_TITLE", "Confirmacion de asistencia"),
      description: env(
        "RSVP_DESCRIPTION",
        "Confirma por grupo. Las respuestas se guardan en la carpeta data del proyecto."
      ),
      groupName: env("RSVP_GROUP_NAME", "Familia invitada"),
      mealOptions: env("RSVP_MEAL_OPTIONS", "Estandar|Vegetariano|Vegano")
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean),
      guests,
    },
  };
}

function parseCountedItems(prefix, count, mapper) {
  const items = [];
  for (let index = 1; index <= count; index += 1) {
    items.push(mapper(index));
  }
  return items;
}

function env(key, fallback = "") {
  return process.env[key] ?? fallback;
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
          guest.attendance === "yes" ? ` | Menu: ${guest.meal || "Sin definir"}` : ""
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
    file: "/data/rsvp-submissions.txt",
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(raw);
}

async function serveStaticFile(res, filePath) {
  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=300",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function safeJoin(basePath, relativePath) {
  const resolved = path.resolve(basePath, relativePath);
  if (!resolved.startsWith(basePath)) {
    throw new Error("Invalid path");
  }
  return resolved;
}
