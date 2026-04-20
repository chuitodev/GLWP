import { promises as fs } from "node:fs";
import path from "node:path";

const CONFIG_FILENAME = "invitation-config.json";

const DEFAULT_CONFIG = {
  brandLabel: "GLWP INVITATION SYSTEM",
  topbarActionLabel: "Ir a RSVP",
  theme: {
    background: "#fbf5ef",
    backgroundStrong: "#f1e4d6",
    backgroundEnd: "#efe1d2",
    surface: "rgba(255, 252, 247, 0.74)",
    surfaceStrong: "rgba(255, 249, 242, 0.92)",
    border: "rgba(92, 64, 51, 0.14)",
    text: "#34231c",
    textMuted: "#70554a",
    title: "#34231c",
    primary: "#b4664a",
    primarySoft: "rgba(180, 102, 74, 0.12)",
    primaryText: "#fff9f4",
    heroText: "#fff8f1",
    success: "#2d6b4b",
    heroGradientStart: "#4d352c",
    heroGradientMid: "#a66f57",
    heroGradientEnd: "#f3e3d2",
  },
  couple: {
    bride: "Camila",
    groom: "Julian",
    display: "",
  },
  hero: {
    eyebrow: "Nos casamos",
    subtitle:
      "Una celebracion para bailar, abrazar y volver a enamorarnos de la vida juntos.",
    heroPhoto: "",
    heroPhotoAlt: "Foto principal de los novios",
    eventDate: "2026-11-21T17:00:00-06:00",
    timezone: "America/Mexico_City",
    city: "San Miguel de Allende, Guanajuato",
  },
  parents: {
    title: "Nuestros padres",
    text: "",
    groomTitle: "Padres del novio",
    groomNames: [],
    brideTitle: "Padres de la novia",
    brideNames: [],
    galleryPhotos: [],
  },
  timeline: {
    title: "Itinerario",
    description: "",
    items: [],
  },
  dressCode: {
    title: "Dress code",
    description: "Formal contemporaneo.",
    guidance:
      "Sugerimos tonos tierra, marfil, negro profundo o verdes secos. Evitar blanco pleno.",
    palette: ["#4f3b34", "#d6b9a5", "#7a8b6e", "#1e1c1b", "#b4664a"],
    links: [],
  },
  lodging: {
    title: "Hospedaje",
    description: "",
    items: [],
  },
  registry: {
    title: "Mesa de regalos",
    description: "",
    items: [],
  },
  notes: {
    title: "Indicaciones finales",
    items: [],
  },
  rsvp: {
    title: "Confirmacion de asistencia",
    description:
      "Confirma por grupo. Las respuestas se guardan en la carpeta storage/data del proyecto.",
    groupName: "Familia invitada",
    dietaryQuestion: "Tiene alguna restriccion alimentaria?",
    dietaryOptions: ["No, ninguna", "Si, vegetariano", "Si, vegano"],
    guests: [],
  },
};

export function createConfigStore({ dataDir }) {
  const configPath = path.join(dataDir, CONFIG_FILENAME);

  return {
    configPath,
    async ensure() {
      await fs.mkdir(dataDir, { recursive: true });
      try {
        await fs.access(configPath);
      } catch {
        const seeded = normalizeInvitationConfig(seedConfigFromEnv(process.env));
        await writeAtomicJson(configPath, seeded);
      }
    },
    async load() {
      await this.ensure();
      const raw = await fs.readFile(configPath, "utf8");
      const parsed = JSON.parse(raw);
      return normalizeInvitationConfig(parsed);
    },
    async save(input) {
      await this.ensure();
      const normalized = normalizeInvitationConfig(input);
      await writeAtomicJson(configPath, normalized);
      return normalized;
    },
    async resetFromSeed() {
      const seeded = normalizeInvitationConfig(seedConfigFromEnv(process.env));
      await writeAtomicJson(configPath, seeded);
      return seeded;
    },
  };
}

export function normalizeInvitationConfig(input = {}) {
  const merged = {
    ...DEFAULT_CONFIG,
    ...asObject(input),
    theme: { ...DEFAULT_CONFIG.theme, ...asObject(input.theme) },
    couple: { ...DEFAULT_CONFIG.couple, ...asObject(input.couple) },
    hero: { ...DEFAULT_CONFIG.hero, ...asObject(input.hero) },
    parents: { ...DEFAULT_CONFIG.parents, ...asObject(input.parents) },
    timeline: { ...DEFAULT_CONFIG.timeline, ...asObject(input.timeline) },
    dressCode: { ...DEFAULT_CONFIG.dressCode, ...asObject(input.dressCode) },
    lodging: { ...DEFAULT_CONFIG.lodging, ...asObject(input.lodging) },
    registry: { ...DEFAULT_CONFIG.registry, ...asObject(input.registry) },
    notes: { ...DEFAULT_CONFIG.notes, ...asObject(input.notes) },
    rsvp: { ...DEFAULT_CONFIG.rsvp, ...asObject(input.rsvp) },
  };

  merged.brandLabel = asString(merged.brandLabel, DEFAULT_CONFIG.brandLabel);
  merged.topbarActionLabel = asString(
    merged.topbarActionLabel,
    DEFAULT_CONFIG.topbarActionLabel
  );

  merged.theme = {
    background: asString(merged.theme.background, DEFAULT_CONFIG.theme.background),
    backgroundStrong: asString(
      merged.theme.backgroundStrong,
      DEFAULT_CONFIG.theme.backgroundStrong
    ),
    backgroundEnd: asString(merged.theme.backgroundEnd, DEFAULT_CONFIG.theme.backgroundEnd),
    surface: asString(merged.theme.surface, DEFAULT_CONFIG.theme.surface),
    surfaceStrong: asString(merged.theme.surfaceStrong, DEFAULT_CONFIG.theme.surfaceStrong),
    border: asString(merged.theme.border, DEFAULT_CONFIG.theme.border),
    text: asString(merged.theme.text, DEFAULT_CONFIG.theme.text),
    textMuted: asString(merged.theme.textMuted, DEFAULT_CONFIG.theme.textMuted),
    title: asString(merged.theme.title, DEFAULT_CONFIG.theme.title),
    primary: asString(merged.theme.primary, DEFAULT_CONFIG.theme.primary),
    primarySoft: asString(merged.theme.primarySoft, DEFAULT_CONFIG.theme.primarySoft),
    primaryText: asString(merged.theme.primaryText, DEFAULT_CONFIG.theme.primaryText),
    heroText: asString(merged.theme.heroText, DEFAULT_CONFIG.theme.heroText),
    success: asString(merged.theme.success, DEFAULT_CONFIG.theme.success),
    heroGradientStart: asString(
      merged.theme.heroGradientStart,
      DEFAULT_CONFIG.theme.heroGradientStart
    ),
    heroGradientMid: asString(merged.theme.heroGradientMid, DEFAULT_CONFIG.theme.heroGradientMid),
    heroGradientEnd: asString(merged.theme.heroGradientEnd, DEFAULT_CONFIG.theme.heroGradientEnd),
  };

  merged.couple = {
    bride: asString(merged.couple.bride, DEFAULT_CONFIG.couple.bride),
    groom: asString(merged.couple.groom, DEFAULT_CONFIG.couple.groom),
    display: asString(merged.couple.display),
  };

  merged.hero = {
    eyebrow: asString(merged.hero.eyebrow, DEFAULT_CONFIG.hero.eyebrow),
    subtitle: asString(merged.hero.subtitle, DEFAULT_CONFIG.hero.subtitle),
    heroPhoto: asString(merged.hero.heroPhoto),
    heroPhotoAlt: asString(merged.hero.heroPhotoAlt, DEFAULT_CONFIG.hero.heroPhotoAlt),
    eventDate: asString(merged.hero.eventDate, DEFAULT_CONFIG.hero.eventDate),
    timezone: asString(merged.hero.timezone, DEFAULT_CONFIG.hero.timezone),
    city: asString(merged.hero.city, DEFAULT_CONFIG.hero.city),
  };

  merged.parents = {
    title: asString(merged.parents.title, DEFAULT_CONFIG.parents.title),
    text: asString(merged.parents.text),
    groomTitle: asString(merged.parents.groomTitle, DEFAULT_CONFIG.parents.groomTitle),
    groomNames: normalizeStringList(merged.parents.groomNames),
    brideTitle: asString(merged.parents.brideTitle, DEFAULT_CONFIG.parents.brideTitle),
    brideNames: normalizeStringList(merged.parents.brideNames),
    galleryPhotos: normalizeObjectList(merged.parents.galleryPhotos, (item, index) => ({
      id: ensureId(item.id, `gallery-${index + 1}`),
      src: asString(item.src),
      alt: asString(item.alt, `Foto ${index + 1} de la historia`),
    })).filter((item) => item.src || item.alt),
  };

  merged.timeline = {
    title: asString(merged.timeline.title, DEFAULT_CONFIG.timeline.title),
    description: asString(merged.timeline.description),
    items: normalizeObjectList(merged.timeline.items, (item, index) => ({
      id: ensureId(item.id, `timeline-${index + 1}`),
      label: asString(item.label),
      time: asString(item.time),
      venue: asString(item.venue),
      address: asString(item.address),
      mapsUrl: asString(item.mapsUrl),
    })).filter(hasMeaningfulFields),
  };

  merged.dressCode = {
    title: asString(merged.dressCode.title, DEFAULT_CONFIG.dressCode.title),
    description: asString(merged.dressCode.description, DEFAULT_CONFIG.dressCode.description),
    guidance: asString(merged.dressCode.guidance, DEFAULT_CONFIG.dressCode.guidance),
    palette: normalizeStringList(merged.dressCode.palette),
    links: normalizeObjectList(merged.dressCode.links, (item, index) => ({
      id: ensureId(item.id, `dress-link-${index + 1}`),
      label: asString(item.label),
      url: asString(item.url),
    })).filter(hasMeaningfulFields),
  };

  merged.lodging = {
    title: asString(merged.lodging.title, DEFAULT_CONFIG.lodging.title),
    description: asString(merged.lodging.description),
    items: normalizeObjectList(merged.lodging.items, (item, index) => ({
      id: ensureId(item.id, `lodging-${index + 1}`),
      minutes: asString(item.minutes),
      name: asString(item.name),
      address: asString(item.address),
      mapsUrl: asString(item.mapsUrl),
    })).filter(hasMeaningfulFields),
  };

  merged.registry = {
    title: asString(merged.registry.title, DEFAULT_CONFIG.registry.title),
    description: asString(merged.registry.description),
    items: normalizeObjectList(merged.registry.items, (item, index) => ({
      id: ensureId(item.id, `registry-${index + 1}`),
      title: asString(item.title),
      description: asString(item.description),
      details: normalizeStringList(item.details),
      actionLabel: asString(item.actionLabel),
      actionUrl: asString(item.actionUrl),
      copyValue: asString(item.copyValue),
    })).filter((item) => hasMeaningfulFields(item) || item.details.length > 0),
  };

  merged.notes = {
    title: asString(merged.notes.title, DEFAULT_CONFIG.notes.title),
    items: normalizeStringList(merged.notes.items),
  };

  merged.rsvp = {
    title: asString(merged.rsvp.title, DEFAULT_CONFIG.rsvp.title),
    description: asString(merged.rsvp.description, DEFAULT_CONFIG.rsvp.description),
    groupName: asString(merged.rsvp.groupName, DEFAULT_CONFIG.rsvp.groupName),
    dietaryQuestion: asString(
      merged.rsvp.dietaryQuestion,
      DEFAULT_CONFIG.rsvp.dietaryQuestion
    ),
    dietaryOptions: normalizeStringList(merged.rsvp.dietaryOptions),
    guests: normalizeObjectList(merged.rsvp.guests, (item, index) => ({
      id: ensureId(item.id, `guest-${index + 1}`),
      name: asString(item.name, `Invitado ${index + 1}`),
    })),
  };

  return merged;
}

export function seedConfigFromEnv(env) {
  const timelineItems = parseCountedItems(Number(readEnv(env, "TIMELINE_COUNT", "3")), (index) => ({
    id: `timeline-${index}`,
    label: readEnv(env, `TIMELINE_${index}_LABEL`),
    time: readEnv(env, `TIMELINE_${index}_TIME`),
    venue: readEnv(env, `TIMELINE_${index}_VENUE`),
    address: readEnv(env, `TIMELINE_${index}_ADDRESS`),
    mapsUrl: readEnv(env, `TIMELINE_${index}_MAPS_URL`),
  }));

  return normalizeInvitationConfig({
    brandLabel: readEnv(env, "BRAND_LABEL", DEFAULT_CONFIG.brandLabel),
    topbarActionLabel: readEnv(env, "TOPBAR_ACTION_LABEL", DEFAULT_CONFIG.topbarActionLabel),
    theme: {
      background: readEnv(env, "THEME_COLOR_BACKGROUND", DEFAULT_CONFIG.theme.background),
      backgroundStrong: readEnv(
        env,
        "THEME_COLOR_BACKGROUND_STRONG",
        DEFAULT_CONFIG.theme.backgroundStrong
      ),
      backgroundEnd: readEnv(
        env,
        "THEME_COLOR_BACKGROUND_END",
        DEFAULT_CONFIG.theme.backgroundEnd
      ),
      surface: readEnv(env, "THEME_COLOR_SURFACE", DEFAULT_CONFIG.theme.surface),
      surfaceStrong: readEnv(
        env,
        "THEME_COLOR_SURFACE_STRONG",
        DEFAULT_CONFIG.theme.surfaceStrong
      ),
      border: readEnv(env, "THEME_COLOR_BORDER", DEFAULT_CONFIG.theme.border),
      text: readEnv(env, "THEME_COLOR_TEXT", DEFAULT_CONFIG.theme.text),
      textMuted: readEnv(env, "THEME_COLOR_TEXT_MUTED", DEFAULT_CONFIG.theme.textMuted),
      title: readEnv(env, "THEME_COLOR_TITLE", DEFAULT_CONFIG.theme.title),
      primary: readEnv(env, "THEME_COLOR_PRIMARY", DEFAULT_CONFIG.theme.primary),
      primarySoft: readEnv(env, "THEME_COLOR_PRIMARY_SOFT", DEFAULT_CONFIG.theme.primarySoft),
      primaryText: readEnv(env, "THEME_COLOR_PRIMARY_TEXT", DEFAULT_CONFIG.theme.primaryText),
      heroText: readEnv(env, "THEME_COLOR_HERO_TEXT", DEFAULT_CONFIG.theme.heroText),
      success: readEnv(env, "THEME_COLOR_SUCCESS", DEFAULT_CONFIG.theme.success),
      heroGradientStart: readEnv(
        env,
        "THEME_HERO_GRADIENT_START",
        DEFAULT_CONFIG.theme.heroGradientStart
      ),
      heroGradientMid: readEnv(
        env,
        "THEME_HERO_GRADIENT_MID",
        DEFAULT_CONFIG.theme.heroGradientMid
      ),
      heroGradientEnd: readEnv(
        env,
        "THEME_HERO_GRADIENT_END",
        DEFAULT_CONFIG.theme.heroGradientEnd
      ),
    },
    couple: {
      bride: readEnv(env, "BRIDE_NAME", DEFAULT_CONFIG.couple.bride),
      groom: readEnv(env, "GROOM_NAME", DEFAULT_CONFIG.couple.groom),
      display: readEnv(env, "COUPLE_DISPLAY_NAME"),
    },
    hero: {
      eyebrow: readEnv(env, "HERO_EYEBROW", DEFAULT_CONFIG.hero.eyebrow),
      subtitle: readEnv(env, "HERO_SUBTITLE", DEFAULT_CONFIG.hero.subtitle),
      heroPhoto: readEnv(env, "HERO_PHOTO"),
      heroPhotoAlt: readEnv(env, "HERO_PHOTO_ALT", DEFAULT_CONFIG.hero.heroPhotoAlt),
      eventDate: readEnv(env, "EVENT_DATE", DEFAULT_CONFIG.hero.eventDate),
      timezone: readEnv(env, "EVENT_TIMEZONE", DEFAULT_CONFIG.hero.timezone),
      city: readEnv(env, "EVENT_CITY", DEFAULT_CONFIG.hero.city),
    },
    parents: {
      title: readEnv(env, "PARENTS_SECTION_TITLE", DEFAULT_CONFIG.parents.title),
      text: readEnv(env, "PARENTS_SECTION_TEXT"),
      groomTitle: readEnv(env, "GROOM_PARENTS_TITLE", DEFAULT_CONFIG.parents.groomTitle),
      groomNames: splitList(readEnv(env, "GROOM_PARENTS_NAMES")),
      brideTitle: readEnv(env, "BRIDE_PARENTS_TITLE", DEFAULT_CONFIG.parents.brideTitle),
      brideNames: splitList(readEnv(env, "BRIDE_PARENTS_NAMES")),
      galleryPhotos: [1, 2, 3].map((index) => ({
        id: `gallery-${index}`,
        src: readEnv(env, `STORY_PHOTO_${index}`),
        alt: readEnv(env, `STORY_PHOTO_${index}_ALT`, `Foto ${index} de la historia`),
      })),
    },
    timeline: {
      title: readEnv(env, "TIMELINE_TITLE", DEFAULT_CONFIG.timeline.title),
      description: readEnv(env, "TIMELINE_DESCRIPTION"),
      items: timelineItems,
    },
    dressCode: {
      title: readEnv(env, "DRESS_TITLE", DEFAULT_CONFIG.dressCode.title),
      description: readEnv(env, "DRESS_DESCRIPTION", DEFAULT_CONFIG.dressCode.description),
      guidance: readEnv(env, "DRESS_GUIDANCE", DEFAULT_CONFIG.dressCode.guidance),
      palette: splitCsv(readEnv(env, "DRESS_PALETTE")),
      links: parseCountedItems(Number(readEnv(env, "DRESS_LINK_COUNT", "0")), (index) => ({
        id: `dress-link-${index}`,
        label: readEnv(env, `DRESS_LINK_${index}_LABEL`),
        url: readEnv(env, `DRESS_LINK_${index}_URL`),
      })),
    },
    lodging: {
      title: readEnv(env, "LODGING_TITLE", DEFAULT_CONFIG.lodging.title),
      description: readEnv(env, "LODGING_DESCRIPTION"),
      items: parseCountedItems(Number(readEnv(env, "LODGING_COUNT", "0")), (index) => ({
        id: `lodging-${index}`,
        minutes: readEnv(env, `LODGING_${index}_MINUTES`),
        name: readEnv(env, `LODGING_${index}_NAME`),
        address: readEnv(env, `LODGING_${index}_ADDRESS`),
        mapsUrl: readEnv(env, `LODGING_${index}_MAPS_URL`),
      })),
    },
    registry: {
      title: readEnv(env, "REGISTRY_TITLE", DEFAULT_CONFIG.registry.title),
      description: readEnv(env, "REGISTRY_DESCRIPTION"),
      items: parseCountedItems(Number(readEnv(env, "REGISTRY_COUNT", "0")), (index) => ({
        id: `registry-${index}`,
        title: readEnv(env, `REGISTRY_${index}_TITLE`),
        description: readEnv(env, `REGISTRY_${index}_DESCRIPTION`),
        details: splitList(readEnv(env, `REGISTRY_${index}_DETAILS`)),
        actionLabel: readEnv(env, `REGISTRY_${index}_ACTION_LABEL`),
        actionUrl: readEnv(env, `REGISTRY_${index}_ACTION_URL`),
        copyValue: readEnv(env, `REGISTRY_${index}_COPY_VALUE`),
      })),
    },
    notes: {
      title: readEnv(env, "NOTES_TITLE", DEFAULT_CONFIG.notes.title),
      items: parseCountedItems(Number(readEnv(env, "NOTE_COUNT", "0")), (index) =>
        readEnv(env, `NOTE_${index}`)
      ),
    },
    rsvp: {
      title: readEnv(env, "RSVP_TITLE", DEFAULT_CONFIG.rsvp.title),
      description: readEnv(env, "RSVP_DESCRIPTION", DEFAULT_CONFIG.rsvp.description),
      groupName: readEnv(env, "RSVP_GROUP_NAME", DEFAULT_CONFIG.rsvp.groupName),
      dietaryQuestion: readEnv(
        env,
        "RSVP_DIETARY_QUESTION",
        DEFAULT_CONFIG.rsvp.dietaryQuestion
      ),
      dietaryOptions: splitList(
        readEnv(
          env,
          "RSVP_DIETARY_OPTIONS",
          readEnv(env, "RSVP_MEAL_OPTIONS", DEFAULT_CONFIG.rsvp.dietaryOptions.join("|"))
        )
      ),
      guests: parseCountedItems(Number(readEnv(env, "GUEST_COUNT", "0")), (index) => ({
        id: `guest-${index}`,
        name: readEnv(env, `GUEST_${index}_NAME`, `Invitado ${index}`),
      })),
    },
  });
}

async function writeAtomicJson(filePath, value) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, serialized, "utf8");
  try {
    await fs.rename(tempPath, filePath);
  } catch (error) {
    if (error && error.code !== "EPERM") {
      throw error;
    }
    await fs.writeFile(filePath, serialized, "utf8");
  }
}

function parseCountedItems(count, mapper) {
  const items = [];
  for (let index = 1; index <= count; index += 1) {
    items.push(mapper(index));
  }
  return items;
}

function readEnv(env, key, fallback = "") {
  return env[key] ?? fallback;
}

function splitList(value = "", separator = "|") {
  return String(value)
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCsv(value = "") {
  return splitList(value, ",");
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeObjectList(value, mapper) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => mapper(asObject(item), index));
}

function asString(value, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function ensureId(value, fallback) {
  const id = asString(value, fallback);
  return id || fallback;
}

function hasMeaningfulFields(item) {
  return Object.entries(item).some(([key, value]) => key !== "id" && String(value || "").trim());
}
