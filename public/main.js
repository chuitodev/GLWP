const app = document.querySelector("#app");

const state = {
  config: null,
  loading: true,
  error: "",
  rsvp: {
    submitted: false,
    message: "",
    guests: [],
  },
};

bootstrap();

async function bootstrap() {
  render();

  try {
    const response = await fetch("/api/config");
    if (!response.ok) {
      throw new Error("No fue posible cargar la configuracion.");
    }

    const config = await response.json();
    state.config = normalizeConfig(config);
    state.rsvp.guests = state.config.rsvp.guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      attendance: "",
      dietaryRestriction: state.config.rsvp.dietaryOptions[0] || "",
    }));
    state.loading = false;
    render();
    startCountdown();
  } catch (error) {
    state.loading = false;
    state.error = error.message;
    render();
  }
}

function normalizeConfig(config) {
  const displayName =
    config.couple.display ||
    `${config.couple.bride || ""}${config.couple.bride && config.couple.groom ? " & " : ""}${config.couple.groom || ""}`;

  return {
    ...config,
    parents: {
      ...config.parents,
      groomNames: Array.isArray(config.parents.groomNames) ? config.parents.groomNames : [],
      brideNames: Array.isArray(config.parents.brideNames) ? config.parents.brideNames : [],
    },
    couple: {
      ...config.couple,
      display: displayName,
    },
  };
}

function applyTheme(theme) {
  if (!theme) return;

  const vars = {
    "--bg": theme.background,
    "--bg-strong": theme.backgroundStrong,
    "--bg-end": theme.backgroundEnd,
    "--surface": theme.surface,
    "--surface-strong": theme.surfaceStrong,
    "--line": theme.border,
    "--text": theme.text,
    "--muted": theme.textMuted,
    "--title": theme.title,
    "--accent": theme.primary,
    "--accent-soft": theme.primarySoft,
    "--accent-contrast": theme.primaryText,
    "--hero-text": theme.heroText,
    "--success": theme.success,
    "--hero-gradient-start": theme.heroGradientStart,
    "--hero-gradient-mid": theme.heroGradientMid,
    "--hero-gradient-end": theme.heroGradientEnd,
  };

  Object.entries(vars).forEach(([key, value]) => {
    if (value) {
      document.documentElement.style.setProperty(key, value);
    }
  });
}

function startCountdown() {
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  if (!state.config) return;
  const container = document.querySelector("#countdown");
  if (!container) return;

  const diff = Math.max(new Date(state.config.hero.eventDate).getTime() - Date.now(), 0);
  const seconds = Math.floor(diff / 1000);
  const values = [
    Math.floor(seconds / 86400),
    Math.floor((seconds % 86400) / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ];

  values.forEach((value, index) => {
    const node = container.children[index]?.querySelector(".countdown__value");
    if (node) node.textContent = String(value).padStart(2, "0");
  });
}

function render() {
  if (state.loading) {
    app.innerHTML = `
      <section class="section loading-state">
        <div class="section__header">
          <span class="eyebrow">Cargando</span>
          <h2>Preparando invitacion</h2>
          <p>Estamos leyendo el archivo .env y acomodando las fotos y datos del evento.</p>
        </div>
      </section>
    `;
    return;
  }

  if (state.error) {
    app.innerHTML = `
      <section class="section error-state">
        <div class="section__header">
          <span class="eyebrow">Error</span>
          <h2>No pudimos cargar la invitacion</h2>
          <p>${escapeHtml(state.error)}</p>
        </div>
      </section>
    `;
    return;
  }

  const config = state.config;
  applyTheme(config.theme);
  const brandLabel = document.querySelector("#brand-label");
  const topbarAction = document.querySelector("#topbar-action");
  if (brandLabel) brandLabel.textContent = config.brandLabel;
  if (topbarAction) topbarAction.textContent = config.topbarActionLabel;

  app.innerHTML = `
    ${renderHero(config)}
    ${renderParents(config)}
    ${renderTimeline(config)}
    ${renderDressCode(config)}
    ${renderLodging(config)}
    ${renderRegistry(config)}
    ${renderNotes(config)}
    ${renderRsvp(config)}
    ${renderFooter()}
  `;

  bindRsvpEvents();
}

function renderHero(config) {
  const cards = [
    {
      label: "Fecha del evento",
      title: formatEventDate(config.hero.eventDate, config.hero.timezone, "date"),
      meta: formatEventDate(config.hero.eventDate, config.hero.timezone, "long"),
    },
    ...config.hero.cards.map((item) => ({
      label: item.label,
      title: `${item.time || ""}${item.time && item.venue ? " - " : ""}${item.venue || ""}`,
      meta: item.address || "",
    })),
  ].slice(0, 4);

  return `
    <section class="hero" id="inicio">
      <div class="hero__content">
        <div class="hero__eyebrow">${escapeHtml(config.hero.eyebrow)}</div>
        <div>
          <h1>${escapeHtml(config.couple.display)}</h1>
          <p class="hero__lede">${escapeHtml(config.hero.subtitle)}</p>
        </div>
        <div class="hero__meta">
          ${cards
            .map(
              (card) => `
                <article class="meta-card hero-info-card">
                  <span class="hero-info-card__label">${escapeHtml(card.label)}</span>
                  <strong class="hero-info-card__title">${escapeHtml(card.title)}</strong>
                  ${card.meta ? `<span class="hero-info-card__meta">${escapeHtml(card.meta)}</span>` : ""}
                </article>
              `
            )
            .join("")}
        </div>
        <div class="hero__actions">
          <a class="button" href="#rsvp">Confirmar asistencia</a>
          <a class="button--ghost" href="#itinerario">Ver itinerario</a>
        </div>
        <div class="countdown" id="countdown">
          ${["Dias", "Horas", "Min", "Seg"]
            .map(
              (label) => `
                <div class="countdown__item">
                  <div class="countdown__value">00</div>
                  <div>${label}</div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
      <aside class="hero__poster">
        ${renderPhoto(config.hero.heroPhoto, config.hero.heroPhotoAlt, "poster-frame poster-frame--photo")}
      </aside>
    </section>
  `;
}

function renderParents(config) {
  const galleryClass =
    config.parents.galleryPhotos.length >= 3 ? "gallery gallery--photos gallery--photos-featured" : "gallery gallery--photos";

  return `
    <section class="section" id="familia">
      <div class="section__header section__header--center">
        <span class="eyebrow">Familia</span>
        <h2>${escapeHtml(config.parents.title)}</h2>
        ${
          config.parents.text
            ? `<p class="section__copy section__copy--center">${escapeHtml(config.parents.text)}</p>`
            : ""
        }
      </div>
      <div class="parents-layout">
        <article class="parents-card">
          <span class="parents-card__label">${escapeHtml(config.parents.groomTitle)}</span>
          <div class="parents-card__names">
            ${config.parents.groomNames.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}
          </div>
        </article>
        <article class="parents-card">
          <span class="parents-card__label">${escapeHtml(config.parents.brideTitle)}</span>
          <div class="parents-card__names">
            ${config.parents.brideNames.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}
          </div>
        </article>
      </div>
      <div class="${galleryClass}">
        ${config.parents.galleryPhotos
          .map((photo, index) => renderPhoto(photo.src, photo.alt, `gallery__photo gallery__photo--${index + 1}`))
          .join("")}
      </div>
    </section>
  `;
}

function renderTimeline(config) {
  return `
    <section class="section" id="itinerario">
      <div class="section__header">
        <span class="eyebrow">Logistica</span>
        <h2>${escapeHtml(config.timeline.title)}</h2>
        <p>${escapeHtml(config.timeline.description)}</p>
      </div>
      <div class="timeline">
        ${config.timeline.items
          .map(
            (item) => `
              <article class="timeline-item">
                <div class="timeline-item__time">${escapeHtml(item.time)}</div>
                <div class="timeline-item__content">
                  <span class="timeline-item__title">${escapeHtml(item.label)}</span>
                  <div class="timeline-item__meta">${escapeHtml(item.venue)}</div>
                  ${item.address ? `<div class="timeline-item__address">${escapeHtml(item.address)}</div>` : ""}
                </div>
                ${
                  item.mapsUrl
                    ? `<a class="timeline-item__link button-link" href="${escapeHtml(item.mapsUrl)}" target="_blank" rel="noreferrer">Ver mapa</a>`
                    : ""
                }
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderDressCode(config) {
  const inspirationLink = config.dressCode.links[0];

  return `
    <section class="section" id="dress-code">
      <div class="section__header">
        <span class="eyebrow">Estilo</span>
        <h2>${escapeHtml(config.dressCode.title)}</h2>
        <p>${escapeHtml(config.dressCode.description)}</p>
      </div>
      <div class="dress-code">
        <div class="dress-code__content">
          <p>${escapeHtml(config.dressCode.guidance)}</p>
          <div class="swatch-list">
            ${config.dressCode.palette
              .map((color) => `<span class="swatch" style="background:${escapeHtml(color)}"></span>`)
              .join("")}
          </div>
        </div>
        ${
          inspirationLink
            ? `
              <div class="link-buttons">
                <a class="button button--secondary" href="${escapeHtml(inspirationLink.url)}" target="_blank" rel="noreferrer">
                  ${escapeHtml(inspirationLink.label)}
                </a>
              </div>
            `
            : ""
        }
      </div>
    </section>
  `;
}

function renderLodging(config) {
  return `
    <section class="section" id="hospedaje">
      <div class="section__header">
        <span class="eyebrow">Fin de semana</span>
        <h2>${escapeHtml(config.lodging.title)}</h2>
        <p>${escapeHtml(config.lodging.description)}</p>
      </div>
      <div class="lodging-carousel">
        ${config.lodging.items
          .map(
            (item) => `
              <article class="lodging-card">
                <div class="lodging-card__content">
                  <span class="eyebrow">${escapeHtml(item.minutes)}</span>
                  <span class="lodging-card__name">${escapeHtml(item.name)}</span>
                  <div>${escapeHtml(item.address)}</div>
                </div>
                ${
                  item.mapsUrl
                    ? `<a class="lodging-card__action button-link" href="${escapeHtml(item.mapsUrl)}" target="_blank" rel="noreferrer">Ver ubicacion</a>`
                    : ""
                }
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderRegistry(config) {
  return `
    <section class="section" id="regalos">
      <div class="section__header">
        <span class="eyebrow">Regalos</span>
        <h2>${escapeHtml(config.registry.title)}</h2>
        <p>${escapeHtml(config.registry.description)}</p>
      </div>
      <div class="registry-list">
        ${config.registry.items
          .map((item) => {
            let action = "";
            if (item.actionUrl) {
              action = `<a class="registry-item__action button-link" href="${escapeHtml(item.actionUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.actionLabel || "Abrir")}</a>`;
            } else if (item.copyValue) {
              action = `<button class="registry-item__action button-link button-link--button" type="button" data-copy="${escapeHtml(item.copyValue)}">${escapeHtml(item.actionLabel || "Copiar")}</button>`;
            }

            return `
              <article class="registry-item">
                <span class="registry-item__title">${escapeHtml(item.title)}</span>
                <div>${escapeHtml(item.description)}</div>
                ${
                  item.details.length
                    ? `
                      <div class="registry-item__details">
                        ${item.details
                          .map((detail) => `<div class="registry-item__detail">${escapeHtml(detail)}</div>`)
                          .join("")}
                      </div>
                    `
                    : ""
                }
                ${action}
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderNotes(config) {
  return `
    <section class="section" id="indicaciones">
      <div class="section__header">
        <span class="eyebrow">Antes del gran dia</span>
        <h2>${escapeHtml(config.notes.title)}</h2>
      </div>
      <div class="final-notes">
        ${config.notes.items.map((note) => `<div class="final-note">${escapeHtml(note)}</div>`).join("")}
      </div>
    </section>
  `;
}

function renderRsvp(config) {
  const statusLabel = state.rsvp.submitted ? "Confirmacion enviada" : "Pendiente";
  const statusClass = state.rsvp.submitted ? "status-strip status-strip--confirmed" : "status-strip";

  return `
    <section class="section rsvp" id="rsvp">
      <div class="section__header">
        <span class="eyebrow">RSVP</span>
        <h2>${escapeHtml(config.rsvp.title)}</h2>
        <p>${escapeHtml(config.rsvp.description)}</p>
      </div>
      <div class="${statusClass}">
        <div>
          <div class="eyebrow">Grupo invitado</div>
          <strong>${escapeHtml(config.rsvp.groupName)}</strong>
          <div>Esta respuesta se guardara dentro de la carpeta local del proyecto.</div>
        </div>
        <div class="rsvp-status">
          <div class="eyebrow">Estado</div>
          <strong class="rsvp-status__badge">${escapeHtml(statusLabel)}</strong>
        </div>
      </div>
      <form id="rsvp-form" class="rsvp-form">
        <div class="rsvp-group">
          ${state.rsvp.guests
            .map(
              (guest) => `
                <article class="rsvp-person" data-guest-id="${escapeHtml(guest.id)}">
                  <div class="rsvp-person__header">
                    <span class="rsvp-person__name">${escapeHtml(guest.name)}</span>
                    <span class="eyebrow">Confirmacion individual</span>
                  </div>
                  <div class="rsvp-person__controls">
                    <div class="rsvp-person__decision">
                      <div class="choice-group" role="group" aria-label="Asistencia de ${escapeHtml(guest.name)}">
                        <button class="choice-button ${guest.attendance === "yes" ? "is-active" : ""}" type="button" data-guest-action="attendance" data-guest-id="${escapeHtml(guest.id)}" data-value="yes">Asistire</button>
                        <button class="choice-button ${guest.attendance === "no" ? "is-active" : ""}" type="button" data-guest-action="attendance" data-guest-id="${escapeHtml(guest.id)}" data-value="no">No podre asistir</button>
                      </div>
                      <div class="rsvp-dietary ${guest.attendance === "yes" ? "" : "is-hidden"}">
                        <div class="rsvp-dietary__question">${escapeHtml(config.rsvp.dietaryQuestion)}</div>
                        <div class="choice-group meal-group" role="group" aria-label="Restriccion alimentaria de ${escapeHtml(guest.name)}">
                          ${config.rsvp.dietaryOptions
                            .map(
                              (option) => `
                                <button class="choice-button choice-button--meal ${guest.dietaryRestriction === option ? "is-active" : ""}" type="button" data-guest-action="dietary" data-guest-id="${escapeHtml(guest.id)}" data-value="${escapeHtml(option)}">${escapeHtml(option)}</button>
                              `
                            )
                            .join("")}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
        <div class="rsvp-actions rsvp-actions--stack">
          <button class="button button--submit" type="submit">Enviar confirmacion</button>
          <div class="feedback ${state.rsvp.submitted ? "feedback--success" : ""}">${escapeHtml(state.rsvp.message)}</div>
        </div>
      </form>
    </section>
  `;
}

function renderFooter() {
  return `
    <div class="footer-note">
      <div>Esta version lee el contenido desde .env, sirve fotos locales desde /uploads y guarda RSVP en storage/data.</div>
    </div>
  `;
}

function bindRsvpEvents() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        state.rsvp.message = "No se pudo copiar automaticamente.";
        render();
      }
    });
  });

  document.querySelectorAll("[data-guest-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const guestId = button.getAttribute("data-guest-id");
      const action = button.getAttribute("data-guest-action");
      const value = button.getAttribute("data-value");
      const guest = state.rsvp.guests.find((item) => item.id === guestId);
      if (!guest) return;

      if (action === "attendance") {
        guest.attendance = value;
        if (value === "yes" && !guest.dietaryRestriction) {
          guest.dietaryRestriction = state.config.rsvp.dietaryOptions[0] || "";
        }
        if (value === "no") {
          guest.dietaryRestriction = "";
        }
      }

      if (action === "dietary") {
        guest.dietaryRestriction = value;
      }

      state.rsvp.message = "";
      state.rsvp.submitted = false;
      render();
    });
  });

  document.querySelector("#rsvp-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const incompleteGuest = state.rsvp.guests.find((guest) => {
      if (!guest.attendance) return true;
      if (guest.attendance === "yes" && !guest.dietaryRestriction) return true;
      return false;
    });

    if (incompleteGuest) {
      state.rsvp.message = "Completa la asistencia y la restriccion alimentaria de cada invitado antes de enviar.";
      state.rsvp.submitted = false;
      render();
      return;
    }

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName: state.config.rsvp.groupName,
          guests: state.rsvp.guests,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la confirmacion.");
      }

      const result = await response.json();
      state.rsvp.submitted = true;
      state.rsvp.message = result.message;
      render();
    } catch (error) {
      state.rsvp.submitted = false;
      state.rsvp.message = error.message;
      render();
    }
  });
}

function renderPhoto(src, alt, className) {
  if (!src) {
    return `
      <div class="${className} photo-shell photo-shell--placeholder">
        <span>Agrega una foto en /uploads y define su ruta en el archivo .env</span>
      </div>
    `;
  }

  return `
    <div class="${className} photo-shell">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt || "")}" loading="lazy" />
    </div>
  `;
}

function formatEventDate(dateString, timezone, variant) {
  const date = new Date(dateString);
  if (variant === "date") {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: timezone,
    }).format(date);
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
