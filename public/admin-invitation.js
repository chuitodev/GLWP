const SECTIONS = [
  { id: "general", label: "Resumen" },
  { id: "theme", label: "Estilo visual" },
  { id: "hero", label: "Portada" },
  { id: "parents", label: "Familia y fotos" },
  { id: "timeline", label: "Itinerario" },
  { id: "dressCode", label: "Vestimenta" },
  { id: "lodging", label: "Hospedaje" },
  { id: "registry", label: "Regalos" },
  { id: "notes", label: "Notas finales" },
  { id: "rsvp", label: "Confirmacion" },
];

const THEME_PRESETS = {
  terracota: {
    label: "Terracota mate",
    description: "La base calida actual, con luz durazno y acentos suaves.",
    swatches: ["#fbf5ef", "#b4664a", "#4d352c", "#f3e3d2"],
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
  },
  verde: {
    label: "Verde salvia",
    description: "Elegante, organico y tranquilo, pensado para bodas de jardin.",
    swatches: ["#f4f1ea", "#73856d", "#445246", "#dbe2d5"],
    theme: {
      background: "#f4f1ea",
      backgroundStrong: "#e5dfd2",
      backgroundEnd: "#ddd8ca",
      surface: "rgba(252, 250, 246, 0.76)",
      surfaceStrong: "rgba(246, 243, 237, 0.94)",
      border: "rgba(68, 82, 70, 0.16)",
      text: "#223028",
      textMuted: "#5f6d61",
      title: "#223028",
      primary: "#73856d",
      primarySoft: "rgba(115, 133, 109, 0.14)",
      primaryText: "#f7f5f0",
      heroText: "#f5f3ee",
      success: "#48684e",
      heroGradientStart: "#3d493e",
      heroGradientMid: "#73856d",
      heroGradientEnd: "#dfe7d7",
    },
  },
  cafe: {
    label: "Cafe cacao",
    description: "Mas sobrio y editorial, con tonos tierra profundos.",
    swatches: ["#f5efe8", "#8d654e", "#4c362c", "#e4d4c6"],
    theme: {
      background: "#f5efe8",
      backgroundStrong: "#eadfd3",
      backgroundEnd: "#e3d4c6",
      surface: "rgba(255, 250, 245, 0.78)",
      surfaceStrong: "rgba(248, 240, 232, 0.94)",
      border: "rgba(87, 60, 48, 0.16)",
      text: "#2f211c",
      textMuted: "#6f574c",
      title: "#2f211c",
      primary: "#8d654e",
      primarySoft: "rgba(141, 101, 78, 0.14)",
      primaryText: "#fff9f6",
      heroText: "#fff8f4",
      success: "#4c6953",
      heroGradientStart: "#4c362c",
      heroGradientMid: "#8d654e",
      heroGradientEnd: "#ead9ca",
    },
  },
  azul: {
    label: "Azul humo",
    description: "Azul mate y sofisticado, con contraste suave y aspecto sereno.",
    swatches: ["#f2f4f5", "#6c8491", "#3e4f59", "#d7e0e5"],
    theme: {
      background: "#f2f4f5",
      backgroundStrong: "#e1e7ea",
      backgroundEnd: "#d7dfe4",
      surface: "rgba(250, 252, 252, 0.78)",
      surfaceStrong: "rgba(241, 246, 247, 0.94)",
      border: "rgba(62, 79, 89, 0.16)",
      text: "#22333b",
      textMuted: "#61737c",
      title: "#22333b",
      primary: "#6c8491",
      primarySoft: "rgba(108, 132, 145, 0.15)",
      primaryText: "#f8fbfc",
      heroText: "#f7fbfc",
      success: "#567261",
      heroGradientStart: "#3e4f59",
      heroGradientMid: "#6c8491",
      heroGradientEnd: "#d8e2e7",
    },
  },
  rosa: {
    label: "Rosa empolvado",
    description: "Romantico y luminoso, con acento tostado y fondo crema.",
    swatches: ["#f8f1ef", "#bb7d76", "#5a3a36", "#efd9d2"],
    theme: {
      background: "#f8f1ef",
      backgroundStrong: "#efdfdb",
      backgroundEnd: "#e8d4cf",
      surface: "rgba(255, 252, 250, 0.78)",
      surfaceStrong: "rgba(251, 244, 241, 0.94)",
      border: "rgba(90, 58, 54, 0.14)",
      text: "#382320",
      textMuted: "#7f625c",
      title: "#382320",
      primary: "#bb7d76",
      primarySoft: "rgba(187, 125, 118, 0.14)",
      primaryText: "#fff8f6",
      heroText: "#fff8f6",
      success: "#496653",
      heroGradientStart: "#5a3a36",
      heroGradientMid: "#bb7d76",
      heroGradientEnd: "#efd9d2",
    },
  },
  olivo: {
    label: "Olivo mineral",
    description: "Natural y refinado, con verdes secos y base piedra clara.",
    swatches: ["#f3f1eb", "#7c8463", "#4a4f3c", "#dde0d0"],
    theme: {
      background: "#f3f1eb",
      backgroundStrong: "#e4e0d3",
      backgroundEnd: "#d9d7c7",
      surface: "rgba(252, 251, 247, 0.78)",
      surfaceStrong: "rgba(244, 241, 234, 0.94)",
      border: "rgba(74, 79, 60, 0.16)",
      text: "#273024",
      textMuted: "#646b58",
      title: "#273024",
      primary: "#7c8463",
      primarySoft: "rgba(124, 132, 99, 0.15)",
      primaryText: "#f9f7f2",
      heroText: "#f8f6f0",
      success: "#4a684f",
      heroGradientStart: "#4a4f3c",
      heroGradientMid: "#7c8463",
      heroGradientEnd: "#dde0d0",
    },
  },
  vino: {
    label: "Vino suave",
    description: "Mas nocturno y elegante, con contraste calido y acento ciruela.",
    swatches: ["#f7f0ef", "#935b66", "#4f2f38", "#e8d3d7"],
    theme: {
      background: "#f7f0ef",
      backgroundStrong: "#ecdfe0",
      backgroundEnd: "#e2d1d3",
      surface: "rgba(255, 251, 250, 0.78)",
      surfaceStrong: "rgba(247, 239, 238, 0.94)",
      border: "rgba(79, 47, 56, 0.14)",
      text: "#341f25",
      textMuted: "#73545c",
      title: "#341f25",
      primary: "#935b66",
      primarySoft: "rgba(147, 91, 102, 0.14)",
      primaryText: "#fff8f8",
      heroText: "#fff8f8",
      success: "#46644c",
      heroGradientStart: "#4f2f38",
      heroGradientMid: "#935b66",
      heroGradientEnd: "#e8d3d7",
    },
  },
  arena: {
    label: "Arena dorada",
    description: "Neutral y soleado, con calidez suave para un look editorial.",
    swatches: ["#f7f2e8", "#b68a55", "#5b4330", "#eadcc2"],
    theme: {
      background: "#f7f2e8",
      backgroundStrong: "#ede2cf",
      backgroundEnd: "#e4d5bc",
      surface: "rgba(255, 252, 246, 0.8)",
      surfaceStrong: "rgba(249, 243, 233, 0.95)",
      border: "rgba(91, 67, 48, 0.14)",
      text: "#34261d",
      textMuted: "#76604f",
      title: "#34261d",
      primary: "#b68a55",
      primarySoft: "rgba(182, 138, 85, 0.15)",
      primaryText: "#fffaf3",
      heroText: "#fff9f2",
      success: "#4d6952",
      heroGradientStart: "#5b4330",
      heroGradientMid: "#b68a55",
      heroGradientEnd: "#eadcc2",
    },
  },
};

const FALLBACK_TIMEZONES = [
  "America/Mexico_City",
  "America/Cancun",
  "America/Monterrey",
  "America/Tijuana",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Buenos_Aires",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/London",
  "UTC",
];

const TIMEZONE_OPTIONS = getTimezoneOptions();

const state = {
  config: null,
  saving: false,
  uploadingField: "",
};

const nav = document.querySelector("#admin-nav");
const form = document.querySelector("#admin-form");
const statusNode = document.querySelector("#admin-status");
const previewNode = document.querySelector("#admin-preview");
const saveButton = document.querySelector("#save-config");
const resetButton = document.querySelector("#reset-seed");

bootstrap();

async function bootstrap() {
  renderNav();

  try {
    const response = await fetch("/api/admin/config", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error("No fue posible cargar la configuracion del panel.");
    }

    state.config = await response.json();
    renderForm();
    setStatus("Configuracion lista. Puedes cambiar paletas, fotos, horarios y textos desde aqui.");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function renderNav() {
  nav.innerHTML = SECTIONS.map(
    (section) => `<a href="#section-${section.id}">${escapeHtml(section.label)}</a>`
  ).join("");
}

function renderForm() {
  if (!state.config) {
    form.innerHTML = "";
    previewNode.innerHTML = "";
    return;
  }

  renderPreview();

  form.innerHTML = [
    renderGeneralSection(),
    renderThemeSection(),
    renderHeroSection(),
    renderParentsSection(),
    renderTimelineSection(),
    renderDressCodeSection(),
    renderLodgingSection(),
    renderRegistrySection(),
    renderNotesSection(),
    renderRsvpSection(),
  ].join("");

  bindFormEvents();
}

function bindFormEvents() {
  form.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", handleFieldChange);
    if (input.tagName === "SELECT") {
      input.addEventListener("change", handleFieldChange);
    }
  });

  form.querySelectorAll("[data-theme-preset]").forEach((button) => {
    button.addEventListener("click", handleThemePreset);
  });

  form.querySelectorAll("[data-list-action]").forEach((button) => {
    button.addEventListener("click", handleListAction);
  });

  form.querySelectorAll("[data-add-list-item]").forEach((button) => {
    button.addEventListener("click", handleAddItem);
  });

  form.querySelectorAll("[data-datetime-path]").forEach((input) => {
    input.addEventListener("input", handleDateTimeChange);
    input.addEventListener("change", handleDateTimeChange);
  });

  form.querySelectorAll("[data-trigger-upload]").forEach((button) => {
    button.addEventListener("click", handleUploadTrigger);
  });

  form.querySelectorAll("[data-upload-field]").forEach((input) => {
    input.addEventListener("change", handleUploadSelect);
  });
}

function handleFieldChange(event) {
  const target = event.currentTarget;
  const path = target.dataset.field;
  const type = target.dataset.type || "string";
  let value = target.value;

  if (type === "array-lines") {
    value = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  setValueAtPath(state.config, path, value);

  if (path === "hero.timezone") {
    const dateInput = form.querySelector('[data-datetime-path="hero.eventDate"][data-datetime-part="date"]');
    const timeInput = form.querySelector('[data-datetime-path="hero.eventDate"][data-datetime-part="time"]');
    if (dateInput?.value) {
      setValueAtPath(
        state.config,
        "hero.eventDate",
        combineDateTimeWithTimezone(dateInput.value, timeInput?.value || "00:00", value)
      );
    }
  }

  if (isImageField(path)) {
    syncImageFieldUI(path, value);
  }

  if (path === "hero.eventDate" || path === "hero.timezone") {
    syncHeroDateTimeUI();
  }

  renderPreview();
}

function handleDateTimeChange(event) {
  const path = event.currentTarget.dataset.datetimePath;
  if (!path || !state.config) return;

  const dateInput = form.querySelector(`[data-datetime-path="${path}"][data-datetime-part="date"]`);
  const timeInput = form.querySelector(`[data-datetime-path="${path}"][data-datetime-part="time"]`);

  const dateValue = dateInput?.value || "";
  const timeValue = timeInput?.value || "00:00";
  const timezone = state.config.hero.timezone || "UTC";

  if (!dateValue) {
    setValueAtPath(state.config, path, "");
    syncHeroDateTimeUI();
    renderPreview();
    return;
  }

  setValueAtPath(state.config, path, combineDateTimeWithTimezone(dateValue, timeValue, timezone));
  syncHeroDateTimeUI();
  renderPreview();
}

function handleUploadTrigger(event) {
  const inputId = event.currentTarget.dataset.triggerUpload;
  if (!inputId) return;

  const input = document.getElementById(inputId);
  if (!input || input.disabled) return;

  input.value = "";
  input.click();
}

function handleThemePreset(event) {
  const presetKey = event.currentTarget.dataset.themePreset;
  const preset = THEME_PRESETS[presetKey];
  if (!preset || !state.config) return;

  state.config.theme = { ...state.config.theme, ...preset.theme };
  renderForm();
  setStatus(
    `Estilo ${preset.label.toLowerCase()} aplicado. Revisa la vista previa y guarda si te gusta.`,
    "success"
  );
}

function handleAddItem(event) {
  const listPath = event.currentTarget.dataset.addListItem;
  const next = createBlankItem(listPath);
  const list = getValueAtPath(state.config, listPath) || [];
  list.push(next);
  renderForm();
}

function handleListAction(event) {
  const button = event.currentTarget;
  const action = button.dataset.listAction;
  const listPath = button.dataset.listPath;
  const index = Number(button.dataset.index);
  const list = getValueAtPath(state.config, listPath);

  if (!Array.isArray(list)) return;

  if (action === "remove") {
    list.splice(index, 1);
  }

  if (action === "move-up" && index > 0) {
    [list[index - 1], list[index]] = [list[index], list[index - 1]];
  }

  if (action === "move-down" && index < list.length - 1) {
    [list[index + 1], list[index]] = [list[index], list[index + 1]];
  }

  renderForm();
}

async function handleUploadSelect(event) {
  const input = event.currentTarget;
  const path = input.dataset.uploadField;
  const file = input.files?.[0];
  if (!file || !path) return;

  state.uploadingField = path;
  renderForm();
  setStatus(`Subiendo ${file.name}...`);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("No se pudo subir la imagen.");
    }

    const result = await response.json();
    setValueAtPath(state.config, path, result.file.url);
    renderForm();
    setStatus(`Imagen lista: ${result.file.filename}`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    state.uploadingField = "";
    renderForm();
  }
}

saveButton?.addEventListener("click", async () => {
  if (!state.config || state.saving) return;

  state.saving = true;
  setStatus("Guardando cambios...");

  try {
    const response = await fetch("/api/admin/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state.config),
    });

    if (!response.ok) {
      throw new Error("No se pudo guardar la configuracion.");
    }

    const result = await response.json();
    state.config = result.config;
    renderForm();
    setStatus(result.message, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    state.saving = false;
  }
});

resetButton?.addEventListener("click", async () => {
  const accepted = window.confirm(
    "Esto reemplazara la configuracion persistida con la semilla inicial del .env. Deseas continuar?"
  );
  if (!accepted) return;

  setStatus("Restaurando configuracion inicial...");

  try {
    const response = await fetch("/api/admin/seed", { method: "POST" });
    if (!response.ok) {
      throw new Error("No se pudo restaurar la semilla inicial.");
    }
    const result = await response.json();
    state.config = result.config;
    renderForm();
    setStatus(result.message, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

function renderGeneralSection() {
  return sectionTemplate(
    "general",
    "Resumen",
    "Ajusta la identidad general que se ve en la parte superior de la invitacion.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Marca / etiqueta", "brandLabel", "brandLabel")}
        ${fieldTemplate("Boton superior", "topbarActionLabel", "topbarActionLabel")}
      </div>
    `
  );
}

function renderThemeSection() {
  return sectionTemplate(
    "theme",
    "Estilo visual",
    "Elige una paleta completa. Todas mantienen el mismo lenguaje visual, solo cambia el matiz.",
    `
      <div class="theme-presets">
        ${Object.entries(THEME_PRESETS)
          .map(([key, preset]) => themePresetTemplate(key, preset))
          .join("")}
      </div>
      <p class="admin-hint theme-presets__hint">
        Aplica una y revisa la vista previa. Si luego quieres guardar, ya queda lista sin mover colores manualmente.
      </p>
    `
  );
}

function renderHeroSection() {
  return sectionTemplate(
    "hero",
    "Portada",
    "Aqui se define la presentacion principal de la pareja y la foto hero.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Nombre novia", "couple-bride", "couple.bride")}
        ${fieldTemplate("Nombre novio", "couple-groom", "couple.groom")}
        ${fieldTemplate("Nombre visible", "couple-display", "couple.display")}
        ${fieldTemplate("Texto superior", "hero-eyebrow", "hero.eyebrow")}
        ${textareaTemplate("Subtitulo", "hero-subtitle", "hero.subtitle")}
        ${fieldTemplate("Ciudad", "hero-city", "hero.city")}
      </div>
      ${eventDateFieldsetTemplate("Fecha del evento", "hero.eventDate", "hero.timezone")}
      <div class="admin-grid">
        ${imageFieldTemplate("Foto principal", "hero-photo", "hero.heroPhoto")}
        ${fieldTemplate("Alt foto hero", "hero-photoAlt", "hero.heroPhotoAlt")}
      </div>
      <div class="admin-hint">
        El flujo principal usa calendario, hora y zona horaria. La ruta manual de la foto y el ISO quedan escondidos en opciones avanzadas.
      </div>
    `
  );
}

function renderParentsSection() {
  return sectionTemplate(
    "parents",
    "Familia y fotos",
    "Edita la seccion de familia y la galeria secundaria de la invitacion.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Titulo seccion", "parents-title", "parents.title")}
        ${textareaTemplate("Texto apoyo", "parents-text", "parents.text")}
        ${fieldTemplate("Titulo padres novio", "parents-groomTitle", "parents.groomTitle")}
        ${textareaTemplate("Nombres padres novio", "parents-groomNames", "parents.groomNames", "array-lines")}
        ${fieldTemplate("Titulo padres novia", "parents-brideTitle", "parents.brideTitle")}
        ${textareaTemplate("Nombres padres novia", "parents-brideNames", "parents.brideNames", "array-lines")}
      </div>
      ${listSectionTemplate({
        title: "Fotos de galeria",
        path: "parents.galleryPhotos",
        addLabel: "Agregar foto",
        items: state.config.parents.galleryPhotos,
        renderItem: (_, index) => `
          <div class="admin-grid">
            ${imageFieldTemplate("Foto", `parents-gallery-src-${index}`, `parents.galleryPhotos.${index}.src`)}
            ${fieldTemplate("Alt", `parents-gallery-alt-${index}`, `parents.galleryPhotos.${index}.alt`)}
          </div>
        `,
      })}
    `
  );
}

function renderTimelineSection() {
  return sectionTemplate(
    "timeline",
    "Itinerario",
    "Los primeros momentos tambien alimentan la vista previa de la portada.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Titulo", "timeline-title", "timeline.title")}
        ${textareaTemplate("Descripcion", "timeline-description", "timeline.description")}
      </div>
      ${listSectionTemplate({
        title: "Momentos del itinerario",
        path: "timeline.items",
        addLabel: "Agregar momento",
        items: state.config.timeline.items,
        renderItem: (_, index) => `
          <div class="admin-grid">
            ${fieldTemplate("Label", `timeline-label-${index}`, `timeline.items.${index}.label`)}
            ${timeFieldTemplate("Hora", `timeline-time-${index}`, `timeline.items.${index}.time`)}
            ${fieldTemplate("Venue", `timeline-venue-${index}`, `timeline.items.${index}.venue`)}
            ${fieldTemplate("Direccion", `timeline-address-${index}`, `timeline.items.${index}.address`)}
            ${fieldTemplate("Maps URL", `timeline-mapsUrl-${index}`, `timeline.items.${index}.mapsUrl`)}
          </div>
        `,
      })}
    `
  );
}

function renderDressCodeSection() {
  return sectionTemplate(
    "dressCode",
    "Vestimenta",
    "Paleta e inspiracion para que las invitadas entiendan el estilo esperado.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Titulo", "dress-title", "dressCode.title")}
        ${fieldTemplate("Descripcion", "dress-description", "dressCode.description")}
        ${textareaTemplate("Guia", "dress-guidance", "dressCode.guidance")}
        ${textareaTemplate("Paleta (un color por linea)", "dress-palette", "dressCode.palette", "array-lines")}
      </div>
      ${renderPalettePreview(state.config.dressCode.palette)}
      ${listSectionTemplate({
        title: "Links de inspiracion",
        path: "dressCode.links",
        addLabel: "Agregar link",
        items: state.config.dressCode.links,
        renderItem: (_, index) => `
          <div class="admin-grid">
            ${fieldTemplate("Label", `dress-link-label-${index}`, `dressCode.links.${index}.label`)}
            ${fieldTemplate("URL", `dress-link-url-${index}`, `dressCode.links.${index}.url`)}
          </div>
        `,
      })}
    `
  );
}

function renderLodgingSection() {
  return sectionTemplate(
    "lodging",
    "Hospedaje",
    "Opciones sugeridas para el fin de semana de boda.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Titulo", "lodging-title", "lodging.title")}
        ${textareaTemplate("Descripcion", "lodging-description", "lodging.description")}
      </div>
      ${listSectionTemplate({
        title: "Opciones de hospedaje",
        path: "lodging.items",
        addLabel: "Agregar hospedaje",
        items: state.config.lodging.items,
        renderItem: (_, index) => `
          <div class="admin-grid">
            ${fieldTemplate("Minutos", `lodging-minutes-${index}`, `lodging.items.${index}.minutes`)}
            ${fieldTemplate("Nombre", `lodging-name-${index}`, `lodging.items.${index}.name`)}
            ${fieldTemplate("Direccion", `lodging-address-${index}`, `lodging.items.${index}.address`)}
            ${fieldTemplate("Maps URL", `lodging-url-${index}`, `lodging.items.${index}.mapsUrl`)}
          </div>
        `,
      })}
    `
  );
}

function renderRegistrySection() {
  return sectionTemplate(
    "registry",
    "Regalos",
    "Cada item puede informar, abrir un enlace o permitir copiar un dato.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Titulo", "registry-title", "registry.title")}
        ${textareaTemplate("Descripcion", "registry-description", "registry.description")}
      </div>
      ${listSectionTemplate({
        title: "Items de mesa de regalos",
        path: "registry.items",
        addLabel: "Agregar item",
        items: state.config.registry.items,
        renderItem: (_, index) => `
          <div class="admin-grid">
            ${fieldTemplate("Titulo", `registry-item-title-${index}`, `registry.items.${index}.title`)}
            ${fieldTemplate("Descripcion", `registry-item-description-${index}`, `registry.items.${index}.description`)}
            ${textareaTemplate("Detalles (una linea por renglon)", `registry-item-details-${index}`, `registry.items.${index}.details`, "array-lines")}
            ${fieldTemplate("Label accion", `registry-item-actionLabel-${index}`, `registry.items.${index}.actionLabel`)}
            ${fieldTemplate("URL accion", `registry-item-actionUrl-${index}`, `registry.items.${index}.actionUrl`)}
            ${fieldTemplate("Valor a copiar", `registry-item-copyValue-${index}`, `registry.items.${index}.copyValue`)}
          </div>
        `,
      })}
    `
  );
}

function renderNotesSection() {
  return sectionTemplate(
    "notes",
    "Notas finales",
    "Mensajes cortos para cerrar la invitacion y dar contexto adicional.",
    `
      <div class="admin-grid admin-grid--single">
        ${fieldTemplate("Titulo", "notes-title", "notes.title")}
        ${textareaTemplate("Notas (una por linea)", "notes-items", "notes.items", "array-lines")}
      </div>
    `
  );
}

function renderRsvpSection() {
  return sectionTemplate(
    "rsvp",
    "Confirmacion",
    "Configuracion del formulario de asistencia y de los invitados que pertenecen al grupo.",
    `
      <div class="admin-grid">
        ${fieldTemplate("Titulo", "rsvp-title", "rsvp.title")}
        ${textareaTemplate("Descripcion", "rsvp-description", "rsvp.description")}
        ${fieldTemplate("Nombre del grupo", "rsvp-groupName", "rsvp.groupName")}
        ${fieldTemplate("Pregunta alimentaria", "rsvp-question", "rsvp.dietaryQuestion")}
        ${textareaTemplate("Opciones alimentarias (una por linea)", "rsvp-options", "rsvp.dietaryOptions", "array-lines")}
      </div>
      ${listSectionTemplate({
        title: "Invitados",
        path: "rsvp.guests",
        addLabel: "Agregar invitado",
        items: state.config.rsvp.guests,
        renderItem: (_, index) => `
          <div class="admin-grid admin-grid--single">
            ${fieldTemplate("Nombre", `rsvp-guest-name-${index}`, `rsvp.guests.${index}.name`)}
          </div>
        `,
      })}
    `
  );
}

function sectionTemplate(id, title, description, content) {
  return `
    <section class="admin-section" id="section-${escapeHtml(id)}">
      <div class="admin-section__header">
        <div class="eyebrow">${escapeHtml(title)}</div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
      ${content}
    </section>
  `;
}

function listSectionTemplate({ title, path, items, addLabel, renderItem }) {
  return `
    <div class="list-editor">
      <div class="list-card__head">
        <div class="list-card__title">${escapeHtml(title)}</div>
        <button class="button button--secondary admin-list-add" type="button" data-add-list-item="${escapeHtml(path)}">
          ${escapeHtml(addLabel)}
        </button>
      </div>
      ${
        items.length
          ? items
              .map(
                (_, index) => `
                  <div class="list-card">
                    <div class="list-card__head">
                      <div class="list-card__title">${escapeHtml(title)} ${index + 1}</div>
                      <div class="list-card__actions">
                        ${listActionButton("Arriba", "move-up", path, index)}
                        ${listActionButton("Abajo", "move-down", path, index)}
                        ${listActionButton("Eliminar", "remove", path, index)}
                      </div>
                    </div>
                    ${renderItem(_, index)}
                  </div>
                `
              )
              .join("")
          : `<div class="admin-hint">Aun no hay elementos en esta lista.</div>`
      }
    </div>
  `;
}

function listActionButton(label, action, path, index) {
  return `<button type="button" data-list-action="${escapeHtml(action)}" data-list-path="${escapeHtml(path)}" data-index="${index}">${escapeHtml(label)}</button>`;
}

function fieldTemplate(label, key, path, type = "string") {
  const value = getValueAtPath(state.config, path) ?? "";
  return `
    <div class="admin-field">
      <label for="${escapeHtml(key)}">${escapeHtml(label)}</label>
      <div class="admin-field__control admin-field__control--basic">
        <input id="${escapeHtml(key)}" data-field="${escapeHtml(path)}" data-type="${escapeHtml(type)}" value="${escapeHtml(value)}" />
      </div>
    </div>
  `;
}

function timeFieldTemplate(label, key, path) {
  const value = normalizeTimeValue(getValueAtPath(state.config, path) ?? "");
  return `
    <div class="admin-field">
      <label for="${escapeHtml(key)}">${escapeHtml(label)}</label>
      <div class="admin-field__control admin-field__control--basic">
        <input
          id="${escapeHtml(key)}"
          type="time"
          step="60"
          data-field="${escapeHtml(path)}"
          value="${escapeHtml(value)}"
        />
      </div>
    </div>
  `;
}

function eventDateFieldsetTemplate(label, eventDatePath, timezonePath) {
  const parts = splitEventDateParts(
    getValueAtPath(state.config, eventDatePath) ?? "",
    getValueAtPath(state.config, timezonePath) ?? "UTC"
  );

  return `
    <div class="datetime-fieldset">
      <div class="datetime-fieldset__grid">
        <div class="admin-field">
          <label for="hero-event-date">${escapeHtml(label)}</label>
          <input
            id="hero-event-date"
            type="date"
            data-datetime-path="${escapeHtml(eventDatePath)}"
            data-datetime-part="date"
            value="${escapeHtml(parts.date)}"
          />
        </div>
        <div class="admin-field">
          <label for="hero-event-time">Hora del evento</label>
          <input
            id="hero-event-time"
            type="time"
            step="60"
            data-datetime-path="${escapeHtml(eventDatePath)}"
            data-datetime-part="time"
            value="${escapeHtml(parts.time)}"
          />
        </div>
      </div>
      <div class="admin-grid">
        ${selectTemplate("Zona horaria", "hero-timezone", timezonePath, TIMEZONE_OPTIONS)}
      </div>
      <details class="admin-advanced">
        <summary>Usar ISO manual</summary>
        <div class="admin-advanced__body">
          <input
            id="hero-eventDate"
            data-field="${escapeHtml(eventDatePath)}"
            value="${escapeHtml(getValueAtPath(state.config, eventDatePath) ?? "")}"
            placeholder="2026-11-21T17:00:00-06:00"
          />
          <div class="admin-hint">Puedes escribirlo manualmente si necesitas un valor exacto con offset.</div>
        </div>
      </details>
    </div>
  `;
}

function selectTemplate(label, key, path, options) {
  const value = getValueAtPath(state.config, path) ?? "";
  const normalizedOptions = value && !options.includes(value) ? [value, ...options] : options;
  return `
    <div class="admin-field">
      <label for="${escapeHtml(key)}">${escapeHtml(label)}</label>
      <select id="${escapeHtml(key)}" data-field="${escapeHtml(path)}">
        ${normalizedOptions
          .map(
            (option) => `
              <option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>
                ${escapeHtml(option)}
              </option>
            `
          )
          .join("")}
      </select>
    </div>
  `;
}

function imageFieldTemplate(label, key, path) {
  const value = getValueAtPath(state.config, path) ?? "";
  const inputId = escapeHtml(key);
  const uploadId = `${inputId}-upload`;
  const uploading = state.uploadingField === path;

  return `
    <div class="admin-field admin-field--image">
      <label>${escapeHtml(label)}</label>
      <div class="image-field">
        <div class="upload-tools">
          <div class="upload-actions">
            <button
              class="upload-button ${uploading ? "is-uploading" : ""}"
              type="button"
              data-trigger-upload="${escapeHtml(uploadId)}"
              ${uploading ? "disabled" : ""}
            >
              ${uploading ? "Subiendo..." : "Subir desde tu equipo"}
            </button>
            <span data-image-link-slot="${escapeHtml(path)}">${renderImageLinkMarkup(value)}</span>
          </div>
          <div class="upload-preview" data-upload-preview="${escapeHtml(path)}">
            ${renderImagePreviewMarkup(value, label)}
          </div>
          <div class="upload-meta">
            <strong data-image-label="${escapeHtml(path)}">${escapeHtml(getImageLabel(value))}</strong>
            <span>${value ? "Se esta usando esta imagen en la invitacion." : "Todavia no hay una imagen seleccionada."}</span>
          </div>
          <input
            class="upload-input"
            id="${escapeHtml(uploadId)}"
            type="file"
            accept="image/*"
            data-upload-field="${escapeHtml(path)}"
            ${uploading ? "disabled" : ""}
          />
        </div>
        <details class="admin-advanced">
          <summary>Usar ruta manual</summary>
          <div class="admin-advanced__body">
            <input id="${inputId}" data-field="${escapeHtml(path)}" value="${escapeHtml(value)}" placeholder="/uploads/hero.jpg" />
            <div class="admin-hint">Usalo solo si necesitas pegar una ruta existente o una URL externa.</div>
          </div>
        </details>
      </div>
    </div>
  `;
}

function textareaTemplate(label, key, path, type = "string") {
  const value = getValueAtPath(state.config, path);
  const text = Array.isArray(value) ? value.join("\n") : value ?? "";
  return `
    <div class="admin-field">
      <label for="${escapeHtml(key)}">${escapeHtml(label)}</label>
      <textarea id="${escapeHtml(key)}" data-field="${escapeHtml(path)}" data-type="${escapeHtml(type)}">${escapeHtml(text)}</textarea>
    </div>
  `;
}

function themePresetTemplate(key, preset) {
  const isActive = themeMatchesPreset(state.config.theme, preset.theme);
  const style = [
    `--preset-bg:${preset.theme.backgroundStrong}`,
    `--preset-bg-end:${preset.theme.backgroundEnd}`,
    `--preset-border:${preset.theme.border}`,
    `--preset-title:${preset.theme.title}`,
    `--preset-muted:${preset.theme.textMuted}`,
    `--preset-accent-soft:${preset.theme.primarySoft}`,
    `--preset-hero-start:${preset.theme.heroGradientStart}`,
    `--preset-hero-mid:${preset.theme.heroGradientMid}`,
    `--preset-hero-end:${preset.theme.heroGradientEnd}`,
  ].join(";");

  return `
    <button class="theme-preset ${isActive ? "is-active" : ""}" type="button" data-theme-preset="${escapeHtml(key)}" style="${escapeHtml(style)}">
      <div class="theme-preset__header">
        <div>
          <strong>${escapeHtml(preset.label)}</strong>
          <p>${escapeHtml(preset.description)}</p>
        </div>
        <span class="theme-preset__tag">${isActive ? "Activo" : "Aplicar"}</span>
      </div>
      <div class="theme-preset__sample" aria-hidden="true"></div>
      <div class="theme-preset__swatches">
        ${preset.swatches
          .map((color) => `<span style="background:${escapeHtml(color)}"></span>`)
          .join("")}
      </div>
    </button>
  `;
}

function createBlankItem(path) {
  if (path === "parents.galleryPhotos") {
    return { id: `gallery-${Date.now()}`, src: "", alt: "" };
  }
  if (path === "timeline.items") {
    return { id: `timeline-${Date.now()}`, label: "", time: "", venue: "", address: "", mapsUrl: "" };
  }
  if (path === "dressCode.links") {
    return { id: `dress-link-${Date.now()}`, label: "", url: "" };
  }
  if (path === "lodging.items") {
    return { id: `lodging-${Date.now()}`, minutes: "", name: "", address: "", mapsUrl: "" };
  }
  if (path === "registry.items") {
    return {
      id: `registry-${Date.now()}`,
      title: "",
      description: "",
      details: [],
      actionLabel: "",
      actionUrl: "",
      copyValue: "",
    };
  }
  if (path === "rsvp.guests") {
    return { id: `guest-${Date.now()}`, name: "" };
  }
  return { id: `item-${Date.now()}` };
}

function getValueAtPath(source, path) {
  return path.split(".").reduce((value, part) => {
    if (value === undefined || value === null) return undefined;
    return value[isFinite(part) ? Number(part) : part];
  }, source);
}

function setValueAtPath(source, path, value) {
  const parts = path.split(".");
  let current = source;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = isFinite(parts[index]) ? Number(parts[index]) : parts[index];
    current = current[part];
  }

  const last = parts[parts.length - 1];
  current[isFinite(last) ? Number(last) : last] = value;
}

function setStatus(message, variant = "") {
  statusNode.textContent = message;
  statusNode.className = "admin-status";
  if (variant === "success") statusNode.classList.add("is-success");
  if (variant === "error") statusNode.classList.add("is-error");
}

function renderPreview() {
  const config = buildPreviewConfig(state.config);
  const heroImage = config.hero.heroPhoto
    ? `
        <div class="preview-hero__photo">
          <img src="${escapeHtml(config.hero.heroPhoto)}" alt="${escapeHtml(config.hero.heroPhotoAlt || config.couple.display)}" loading="lazy" />
        </div>
      `
    : "";

  previewNode.innerHTML = `
    <div class="admin-preview__header">
      <div>
        <div class="eyebrow">Vista previa</div>
        <h2>Asi se va sintiendo la invitacion</h2>
      </div>
      <p>Se actualiza mientras editas. Para revisar el sitio completo, abre la invitacion en otra pestana.</p>
    </div>
    <div class="preview-phone">
      <div class="preview-phone__screen" style="${previewScreenStyle(config.theme)}">
        <div class="preview-topbar">
          <span class="eyebrow" style="color:${escapeHtml(config.theme.textMuted)}">${escapeHtml(config.brandLabel)}</span>
          <span class="preview-badge" style="background:${escapeHtml(config.theme.primarySoft)}; color:${escapeHtml(config.theme.primary)}; border:1px solid ${escapeHtml(config.theme.border)}">${escapeHtml(config.topbarActionLabel)}</span>
        </div>
        <section class="preview-hero" style="${previewHeroStyle(config.theme)}">
          ${heroImage}
          <span class="preview-hero__eyebrow" style="color:${escapeHtml(config.theme.heroText)}">${escapeHtml(config.hero.eyebrow)}</span>
          <h3 style="color:${escapeHtml(config.theme.heroText)}">${escapeHtml(config.couple.display)}</h3>
          <p style="color:${escapeHtml(config.theme.heroText)}">${escapeHtml(config.hero.subtitle)}</p>
          <div class="preview-meta">
            ${config.timeline.items.slice(0, 2).map((item) => `
              <article class="preview-card" style="${previewCardStyle(config.theme)}">
                <strong style="color:${escapeHtml(config.theme.title)}">${escapeHtml(item.label || "Momento")}</strong>
                <div style="color:${escapeHtml(config.theme.text)}">${escapeHtml(item.time || "Hora por definir")}</div>
                <div style="color:${escapeHtml(config.theme.textMuted)}">${escapeHtml(item.venue || config.hero.city)}</div>
              </article>
            `).join("")}
          </div>
        </section>
        <div class="preview-sections">
          <section class="preview-section" style="${previewSectionStyle(config.theme)}">
            <div class="preview-section__eyebrow" style="color:${escapeHtml(config.theme.textMuted)}">Vestimenta</div>
            <h4 style="color:${escapeHtml(config.theme.title)}">${escapeHtml(config.dressCode.title)}</h4>
            <p style="color:${escapeHtml(config.theme.text)}">${escapeHtml(config.dressCode.guidance)}</p>
            <div class="preview-swatches">
              ${config.dressCode.palette.slice(0, 5).map((color) => `<span style="background:${escapeHtml(color)}"></span>`).join("")}
            </div>
          </section>
          <section class="preview-section" style="${previewSectionStyle(config.theme)}">
            <div class="preview-section__eyebrow" style="color:${escapeHtml(config.theme.textMuted)}">RSVP</div>
            <h4 style="color:${escapeHtml(config.theme.title)}">${escapeHtml(config.rsvp.title)}</h4>
            <p style="color:${escapeHtml(config.theme.text)}">${escapeHtml(config.rsvp.groupName)}</p>
            <div class="preview-badge" style="background:${escapeHtml(config.theme.primary)}; color:${escapeHtml(config.theme.primaryText)}">${escapeHtml(config.rsvp.guests[0]?.name || "Invitado principal")}</div>
          </section>
          <div class="preview-note" style="background:${escapeHtml(config.theme.primarySoft)}; color:${escapeHtml(config.theme.text)}; border:1px solid ${escapeHtml(config.theme.border)}">
            ${escapeHtml(config.notes.items[0] || "Tus cambios visuales se reflejan aqui mientras editas.")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPalettePreview(palette) {
  const colors = Array.isArray(palette) ? palette : [];
  return `
    <div class="palette-preview">
      ${colors.length
        ? colors.map((color) => `<span class="palette-preview__chip" style="background:${escapeHtml(color)}"></span>`).join("")
        : `<span class="admin-hint">Agrega colores para ver la paleta.</span>`}
    </div>
  `;
}

function buildPreviewConfig(config) {
  return {
    ...config,
    couple: {
      ...config.couple,
      display:
        config.couple.display ||
        [config.couple.bride, config.couple.groom].filter(Boolean).join(" & ") ||
        "Pareja",
    },
  };
}

function previewScreenStyle(theme) {
  return [
    `background:
      radial-gradient(circle at 12% 10%, rgba(255, 255, 255, 0.18), transparent 28%),
      radial-gradient(circle at 88% 16%, ${theme.primarySoft}, transparent 22%),
      linear-gradient(180deg, ${theme.backgroundStrong} 0%, ${theme.background} 38%, ${theme.backgroundEnd} 100%)`,
    `color: ${theme.text}`,
  ].join(";");
}

function previewHeroStyle(theme) {
  return [
    `background:
      linear-gradient(118deg, rgba(32, 25, 21, 0.52) 0%, rgba(32, 25, 21, 0.16) 55%, rgba(32, 25, 21, 0.04) 100%),
      linear-gradient(135deg, ${theme.heroGradientStart} 0%, ${theme.heroGradientMid} 48%, ${theme.heroGradientEnd} 100%)`,
    `border: 1px solid ${theme.border}`,
    `box-shadow: 0 20px 34px rgba(73, 44, 33, 0.12)`,
  ].join(";");
}

function previewSectionStyle(theme) {
  return [
    `background: ${theme.surfaceStrong}`,
    `border: 1px solid ${theme.border}`,
    `box-shadow: 0 16px 26px rgba(73, 44, 33, 0.08)`,
  ].join(";");
}

function previewCardStyle(theme) {
  return [
    `background: ${theme.surfaceStrong}`,
    `border: 1px solid ${theme.border}`,
    `box-shadow: 0 14px 24px rgba(73, 44, 33, 0.08)`,
  ].join(";");
}

function syncImageFieldUI(path, value) {
  form.querySelectorAll("[data-field]").forEach((node) => {
    if (node.dataset.field === path && node.value !== value) {
      node.value = value;
    }
  });

  form.querySelectorAll("[data-upload-preview]").forEach((node) => {
    if (node.dataset.uploadPreview === path) {
      node.innerHTML = renderImagePreviewMarkup(value, "Imagen");
    }
  });

  form.querySelectorAll("[data-image-label]").forEach((node) => {
    if (node.dataset.imageLabel === path) {
      node.textContent = getImageLabel(value);
    }
  });

  form.querySelectorAll("[data-image-link-slot]").forEach((node) => {
    if (node.dataset.imageLinkSlot === path) {
      node.innerHTML = renderImageLinkMarkup(value);
    }
  });
}

function syncHeroDateTimeUI() {
  const parts = splitEventDateParts(state.config.hero.eventDate, state.config.hero.timezone);
  const dateInput = form.querySelector('[data-datetime-path="hero.eventDate"][data-datetime-part="date"]');
  const timeInput = form.querySelector('[data-datetime-path="hero.eventDate"][data-datetime-part="time"]');
  const timezoneSelect = form.querySelector('[data-field="hero.timezone"]');
  const isoInput = form.querySelector('[data-field="hero.eventDate"]');

  if (dateInput && dateInput.value !== parts.date) {
    dateInput.value = parts.date;
  }

  if (timeInput && timeInput.value !== parts.time) {
    timeInput.value = parts.time;
  }

  if (timezoneSelect && timezoneSelect.value !== state.config.hero.timezone) {
    timezoneSelect.value = state.config.hero.timezone;
  }

  if (isoInput && isoInput.value !== (state.config.hero.eventDate || "")) {
    isoInput.value = state.config.hero.eventDate || "";
  }
}

function themeMatchesPreset(theme, presetTheme) {
  return Object.entries(presetTheme).every(
    ([key, value]) => normalizeComparableColor(theme[key]) === normalizeComparableColor(value)
  );
}

function normalizeComparableColor(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTimeValue(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function splitEventDateParts(dateString, timezone) {
  const safeTimezone = timezone || "UTC";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return {
      date: String(dateString || "").slice(0, 10),
      time: normalizeTimeValue(String(dateString || "").slice(11, 16)) || "17:00",
    };
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date).reduce((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function combineDateTimeWithTimezone(datePart, timePart, timezone) {
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart || "00:00").split(":").map(Number);
  const wallTimeUtc = Date.UTC(year, month - 1, day, hour || 0, minute || 0, 0);
  const firstOffset = getTimeZoneOffsetMinutes(new Date(wallTimeUtc), timezone);
  const shiftedInstant = wallTimeUtc - firstOffset * 60_000;
  const finalOffset = getTimeZoneOffsetMinutes(new Date(shiftedInstant), timezone);

  return `${datePart}T${normalizeTimeValue(timePart || "00:00") || "00:00"}:00${formatOffset(finalOffset)}`;
}

function getTimeZoneOffsetMinutes(date, timezone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date).reduce((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return Math.round((asUtc - date.getTime()) / 60000);
}

function formatOffset(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function getTimezoneOptions() {
  const supported =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];

  return [...new Set([...FALLBACK_TIMEZONES, ...supported])];
}

function renderImagePreviewMarkup(value, label) {
  if (!value) {
    return `<div class="upload-preview__placeholder">Sin imagen</div>`;
  }

  return `<img class="upload-preview__image" src="${escapeHtml(value)}" alt="${escapeHtml(label)}" loading="lazy" />`;
}

function renderImageLinkMarkup(value) {
  if (!value) return "";
  return `<a class="button button--secondary button--small" href="${escapeHtml(value)}" target="_blank" rel="noreferrer">Ver imagen</a>`;
}

function getImageLabel(value) {
  if (!value) return "Sin imagen seleccionada";

  const segments = String(value).split("/");
  const lastSegment = segments[segments.length - 1] || value;
  return decodeURIComponent(lastSegment);
}

function isImageField(path) {
  return path.endsWith("heroPhoto") || path.endsWith(".src");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
