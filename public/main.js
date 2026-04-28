const app = document.querySelector("#app");
const inviteToken = extractInviteToken();

const state = {
  mode: inviteToken ? "invite" : "preview",
  config: null,
  invitation: null,
  loading: true,
  error: "",
  rsvp: {
    submitted: false,
    message: "",
    guests: [],
  },
};

let toastTimer = 0;
let toastCleanupTimer = 0;

bootstrap();

async function bootstrap() {
  render();

  try {
    const endpoint = inviteToken ? `/api/invite/${encodeURIComponent(inviteToken)}` : "/api/config";
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(
        inviteToken
          ? "No fue posible cargar la invitacion personalizada."
          : "No fue posible cargar la configuracion."
      );
    }

    const payload = await response.json();
    const config = normalizeConfig(inviteToken ? payload.config : payload);

    state.config = config;
    state.invitation = inviteToken ? normalizeInvitation(payload.invitation) : null;
    state.rsvp.guests = seedRsvpGuests(config, state.invitation);
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

function normalizeInvitation(invitation = {}) {
  return {
    ...invitation,
    members: Array.isArray(invitation.members) ? invitation.members : [],
    rsvp: invitation.rsvp || {},
    delivery: invitation.delivery || {},
  };
}

function seedRsvpGuests(config, invitation) {
  const dietaryDefault = config.rsvp.dietaryOptions[0] || "";

  if (invitation) {
    return invitation.members.map((member) => ({
      id: member.id,
      name: member.displayName,
      attendance: "",
      dietaryRestriction: dietaryDefault,
    }));
  }

  return state.config?.rsvp?.guests?.map((guest) => ({
    id: guest.id,
    name: guest.name,
    attendance: "",
    dietaryRestriction: dietaryDefault,
  })) || [];
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
          <p>Estamos cargando la configuracion persistida y preparando los detalles del evento.</p>
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
  if (brandLabel) {
    brandLabel.textContent = state.invitation?.invitationCode || config.brandLabel;
  }
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
  `;

  bindRsvpEvents();
}

function renderHero(config) {
  const cards = [
    {
      label: "Fecha del evento",
      title: formatEventDate(config.hero.eventDate, config.hero.timezone, "date"),
      meta: formatEventDate(config.hero.eventDate, config.hero.timezone, "weekdayTime"),
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
      </div>
      <aside class="hero__poster">
        ${renderPhoto(config.hero.heroPhoto, config.hero.heroPhotoAlt, "poster-frame poster-frame--photo")}
      </aside>
      <div class="hero__countdown">
        <div class="countdown" id="countdown">
          ${["Dias", "Horas", "Min", "Seg"]
            .map(
              (label) => `
                <div class="countdown__item">
                  <div class="countdown__value">00</div>
                  <div class="countdown__label">${label}</div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
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
              const copyMessage =
                String(item.actionLabel || "").toLowerCase().includes("clabe")
                  ? "CLABE copiada al portapapeles."
                  : "Dato copiado al portapapeles.";
              action = `<button class="registry-item__action button-link button-link--button" type="button" data-copy="${escapeHtml(item.copyValue)}" data-copy-message="${escapeHtml(copyMessage)}">${escapeHtml(item.actionLabel || "Copiar")}</button>`;
            }

            return `
              <article class="registry-item">
                <div class="registry-item__content">
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
                </div>
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
  if (state.mode === "invite" && state.invitation) {
    return renderPersonalizedRsvp(config, state.invitation);
  }

  return renderGenericRsvp(config);
}

function renderGenericRsvp(config) {
  const statusLabel = state.rsvp.submitted ? "Confirmacion enviada" : "Pendiente";
  const statusClass = state.rsvp.submitted ? "status-strip status-strip--confirmed" : "status-strip";

  return `
    <section class="section rsvp" id="rsvp">
      <div class="section__header">
        <span class="eyebrow">RSVP</span>
        <h2>${escapeHtml(config.rsvp.title)}</h2>
      </div>
      <div class="${statusClass}">
        <div>
          <div class="eyebrow">Grupo invitado</div>
          <strong>${escapeHtml(config.rsvp.groupName)}</strong>
        </div>
        <div class="rsvp-status">
          <div class="eyebrow">Estado</div>
          <strong class="rsvp-status__badge">${escapeHtml(statusLabel)}</strong>
        </div>
      </div>
      ${renderRsvpForm(config)}
    </section>
  `;
}

function renderPersonalizedRsvp(config, invitation) {
  const locked = Boolean(invitation.rsvp?.lockedAt);
  const displayStatusLabel = invitation.displayStatusLabel || "Pendiente";
  const statusLabel = locked
    ? displayStatusLabel
    : state.rsvp.submitted
      ? "Confirmacion enviada"
      : invitation.delivery?.lastSentAt
        ? "Invitacion enviada"
        : "Pendiente";
  const statusClass =
    locked && invitation.displayStatus === "confirmed"
      ? "status-strip status-strip--confirmed"
      : "status-strip";

  return `
    <section class="section rsvp" id="rsvp">
      <div class="section__header">
        <span class="eyebrow">RSVP privado</span>
        <h2>${escapeHtml(config.rsvp.title)}</h2>
      </div>
      <div class="${statusClass}">
        <div>
          <div class="eyebrow">Codigo visible</div>
          <strong>${escapeHtml(invitation.invitationCode)}</strong>
          <div>${escapeHtml(invitation.familyLabel)}</div>
        </div>
        <div class="rsvp-status">
          <div class="eyebrow">Estado</div>
          <strong class="rsvp-status__badge">${escapeHtml(statusLabel)}</strong>
        </div>
      </div>
      ${
        locked
          ? renderLockedSummary(invitation)
          : `
            <div class="rsvp__intro">
              <p>
                Este enlace es exclusivo para tu grupo. La respuesta se guarda una sola vez y
                despues queda bloqueada.
              </p>
            </div>
            ${renderRsvpForm(config)}
          `
      }
    </section>
  `;
}

function renderRsvpForm(config) {
  return `
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
  `;
}

function renderLockedSummary(invitation) {
  const summary = invitation.rsvp?.summary || { guests: [] };
  return `
    <div class="rsvp-summary-list">
      <div class="rsvp-summary-note">
        Respuesta registrada el ${escapeHtml(
          formatEventDate(
            invitation.rsvp.latestSubmittedAt,
            state.config?.hero?.timezone || "America/Mexico_City",
            "full"
          )
        )}.
      </div>
      <div class="rsvp-summary-grid">
        ${summary.guests
          .map(
            (guest) => `
              <article class="rsvp-summary-card">
                <strong>${escapeHtml(guest.displayName)}</strong>
                <span>${escapeHtml(guest.attendance === "yes" ? "Asiste" : "No asiste")}</span>
                ${
                  guest.attendance === "yes" && guest.dietaryRestriction
                    ? `<small>${escapeHtml(guest.dietaryRestriction)}</small>`
                    : ""
                }
              </article>
            `
          )
          .join("")}
      </div>
      ${
        summary.note
          ? `<div class="final-note">Nota del grupo: ${escapeHtml(summary.note)}</div>`
          : ""
      }
      <div class="feedback feedback--success">
        ${escapeHtml(state.rsvp.message || "Tu respuesta ya quedo guardada y la invitacion se encuentra bloqueada.")}
      </div>
    </div>
  `;
}

function bindRsvpEvents() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy") || "";
      const message = button.getAttribute("data-copy-message") || "Dato copiado al portapapeles.";
      try {
        await navigator.clipboard.writeText(value);
        showToast(message);
      } catch {
        showToast("No se pudo copiar automaticamente.", "error");
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
      state.rsvp.message =
        "Completa la asistencia y la restriccion alimentaria de cada invitado antes de enviar.";
      state.rsvp.submitted = false;
      render();
      return;
    }

    try {
      const response = await fetch(
        inviteToken ? `/api/invite/${encodeURIComponent(inviteToken)}/rsvp` : "/api/rsvp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            inviteToken
              ? {
                  guests: state.rsvp.guests.map((guest) => ({
                    memberId: guest.id,
                    attendance: guest.attendance,
                    dietaryRestriction: guest.dietaryRestriction,
                  })),
                }
              : {
                  groupName: state.config.rsvp.groupName,
                  guests: state.rsvp.guests,
                }
          ),
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "No se pudo guardar la confirmacion.");
      }

      const result = await response.json();
      state.rsvp.submitted = true;
      state.rsvp.message = result.message;
      if (inviteToken) {
        state.invitation = normalizeInvitation(result.group);
      }
      render();
    } catch (error) {
      state.rsvp.submitted = false;
      state.rsvp.message = error.message;
      render();
    }
  });
}

function showToast(message, variant = "success") {
  const host = ensureToastHost();
  const toast = document.createElement("div");
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;

  window.clearTimeout(toastTimer);
  window.clearTimeout(toastCleanupTimer);
  host.replaceChildren(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toastCleanupTimer = window.setTimeout(() => {
      if (host.contains(toast)) {
        toast.remove();
      }
    }, 220);
  }, 2400);
}

function ensureToastHost() {
  let host = document.querySelector("#toast-stack");
  if (host) return host;

  host = document.createElement("div");
  host.id = "toast-stack";
  host.className = "toast-stack";
  host.setAttribute("aria-live", "polite");
  host.setAttribute("aria-atomic", "true");
  document.body.append(host);
  return host;
}

function renderPhoto(src, alt, className) {
  if (!src) {
    return `
      <div class="${className} photo-shell photo-shell--placeholder">
        <span>Agrega una foto en /uploads y registra su ruta desde el panel administrativo.</span>
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
  if (Number.isNaN(date.getTime())) return "";

  if (variant === "date") {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: timezone,
    }).format(date);
  }

  if (variant === "weekdayTime") {
    return new Intl.DateTimeFormat("es-MX", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    }).format(date);
  }

  if (variant === "full") {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(date);
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(date);
}

function extractInviteToken() {
  const match = window.location.pathname.match(/^\/invite\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
