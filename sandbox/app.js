const weddingData = {
  event: {
    id: "wedding-demo-001",
    title: "Camila & Julian",
    subtitle: "Una celebracion para bailar, abrazar y volver a enamorarnos de la vida juntos.",
    timezone: "America/Mexico_City",
    eventDate: "2026-11-21T17:00:00-06:00",
    city: "San Miguel de Allende, Guanajuato",
  },
  presentation: {
    template: "editorial-sunset",
    theme: "warm-minimal",
  },
  sections: [
    {
      type: "hero",
      enabled: true,
      data: {
        eyebrow: "Nos casamos",
        dateLabel: "21 Noviembre 2026",
        countdownEnabled: true,
      },
    },
    {
      type: "narrative",
      enabled: true,
      data: {
        title: "Nuestra historia, contada con calma",
        description:
          "Queremos que esta invitacion se sienta como la antesala del dia: intima, clara y profundamente nuestra.",
        quote:
          "Despues de tantos viajes, sobremesas y planes compartidos, elegimos reunir a quienes mas queremos para celebrar el comienzo de esta nueva etapa.",
        parents: [
          "Con el amor de Martha y Roberto",
          "Y la bendicion de Elena y Fernando",
        ],
        gallery: ["Atardecer", "Carta", "Flores"],
      },
    },
    {
      type: "timeline",
      enabled: true,
      data: {
        title: "Itinerario",
        description:
          "Cada bloque del evento vive como una entidad independiente para que el flujo sea flexible.",
        items: [
          {
            id: "civil",
            name: "Ceremonia civil",
            time: "17:00",
            venue: "Huerto del Angel",
            mapsUrl: "https://maps.google.com/?q=Huerto+del+Angel+San+Miguel+de+Allende",
          },
          {
            id: "cocktail",
            name: "Coctel al atardecer",
            time: "18:30",
            venue: "Jardin de los Naranjos",
            mapsUrl: "https://maps.google.com/?q=Jardin+de+los+Naranjos+San+Miguel+de+Allende",
          },
          {
            id: "reception",
            name: "Cena y recepcion",
            time: "20:00",
            venue: "Casa Adela",
            mapsUrl: "https://maps.google.com/?q=Casa+Adela+San+Miguel+de+Allende",
          },
          {
            id: "after",
            name: "After",
            time: "23:45",
            venue: "Patio de Luz",
            mapsUrl: "https://maps.google.com/?q=Patio+de+Luz+San+Miguel+de+Allende",
          },
        ],
      },
    },
    {
      type: "dress-code",
      enabled: true,
      data: {
        title: "Dress code",
        description:
          "Formal contemporaneo. Queremos una noche elegante, fresca y luminosa.",
        guidance:
          "Sugerimos tonos tierra, marfil, negro profundo o verdes secos. Evitar blanco pleno.",
        palette: ["#4f3b34", "#d6b9a5", "#7a8b6e", "#1e1c1b", "#b4664a"],
        links: [
          { label: "Inspiracion para ellas", href: "https://www.pinterest.com/" },
          { label: "Inspiracion para ellos", href: "https://www.pinterest.com/" },
        ],
      },
    },
    {
      type: "lodging",
      enabled: true,
      data: {
        title: "Hospedaje",
        description:
          "Desliza para ver opciones cercanas. La estructura ya esta preparada como carrusel.",
        items: [
          {
            id: "hotel-1",
            name: "Casa Noa",
            distance: "6 min del evento",
            details: "Boutique hotel, desayuno incluido, transporte sugerido.",
            actionLabel: "Reservar",
            actionUrl: "https://example.com/casa-noa",
          },
          {
            id: "hotel-2",
            name: "Patio Escondido",
            distance: "9 min del evento",
            details: "Tarifa preferencial con codigo CAMIYJULI.",
            actionLabel: "Ver tarifa",
            actionUrl: "https://example.com/patio-escondido",
          },
          {
            id: "hotel-3",
            name: "Casa del Centro",
            distance: "12 min del evento",
            details: "Ubicacion centrica para extender el fin de semana.",
            actionLabel: "Abrir sitio",
            actionUrl: "https://example.com/casa-centro",
          },
        ],
      },
    },
    {
      type: "registry",
      enabled: true,
      data: {
        title: "Mesa de regalos",
        description:
          "Elegimos opciones simples para que regalar sea facil y directo, incluso desde el movil.",
        items: [
          {
            id: "store",
            title: "Liverpool",
            detail: "Mesa digital con envios y pagos seguros.",
            actionLabel: "Abrir mesa",
            actionUrl: "https://example.com/liverpool",
            kind: "link",
          },
          {
            id: "cash",
            title: "Lluvia de sobres",
            detail: "Tendremos un espacio para recibir detalles libres.",
            kind: "text",
          },
          {
            id: "bank",
            title: "Transferencia bancaria",
            detail: "CLABE: 0123 4567 8910 1112 131",
            actionLabel: "Copiar datos",
            kind: "copy",
            copyValue: "CLABE: 0123 4567 8910 1112 131",
          },
        ],
      },
    },
    {
      type: "final-notes",
      enabled: true,
      data: {
        title: "Indicaciones finales",
        notes: [
          "Te recomendamos llegar 20 minutos antes de la ceremonia.",
          "El evento sera mayormente al aire libre, considera llevar un abrigo ligero.",
          "Si necesitas apoyo especial de movilidad, avisanos al confirmar tu asistencia.",
        ],
      },
    },
    {
      type: "rsvp",
      enabled: true,
      data: {
        title: "Confirma tu asistencia",
        description:
          "La confirmacion vive sobre personas asociadas al grupo invitado, no sobre nombres escritos manualmente.",
        allowDietaryPreferences: true,
        dietaryOptions: ["Estandar", "Vegetariano", "Vegano"],
      },
    },
  ],
  guestGroups: {
    "garcia-lopez": {
      id: "group-001",
      token: "garcia-lopez",
      label: "Familia Garcia Lopez",
      members: [
        { id: "guest-1", fullName: "Ana Garcia", attendance: null, mealPreference: "", allergies: "" },
        { id: "guest-2", fullName: "Luis Lopez", attendance: null, mealPreference: "", allergies: "" },
      ],
      rsvpSubmittedAt: null,
    },
    "solo-demo": {
      id: "group-002",
      token: "solo-demo",
      label: "Invitacion individual demo",
      members: [
        { id: "guest-3", fullName: "Daniela Ruiz", attendance: null, mealPreference: "", allergies: "" },
      ],
      rsvpSubmittedAt: null,
    },
  },
};

const app = document.querySelector("#app");
const feedbackState = { message: "" };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getInviteToken() {
  return new URL(window.location.href).searchParams.get("invite") ?? "garcia-lopez";
}

function getStorageKey(token) {
  return `glwp:rsvp:${weddingData.event.id}:${token}`;
}

function loadGuestGroup() {
  const token = getInviteToken();
  const fallback = Object.values(weddingData.guestGroups)[0];
  const base = weddingData.guestGroups[token] ?? fallback;
  const persisted = window.localStorage.getItem(getStorageKey(base.token));
  return persisted ? JSON.parse(persisted) : clone(base);
}

function saveGuestGroup(group) {
  window.localStorage.setItem(getStorageKey(group.token), JSON.stringify(group));
}

function getRsvpConfig() {
  return weddingData.sections.find((section) => section.type === "rsvp").data;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: weddingData.event.timezone,
  }).format(new Date(dateString));
}

function getInvitationState(group) {
  return {
    isConfirmed: Boolean(group.rsvpSubmittedAt),
    completion: group.members.every((member) => {
      if (member.attendance === null) return false;
      if (member.attendance === true && getRsvpConfig().allowDietaryPreferences) {
        return Boolean(member.mealPreference);
      }
      return true;
    }),
  };
}

function renderHero(section) {
  return `
    <section class="hero" id="inicio">
      <div class="hero__content">
        <div class="eyebrow">${escapeHtml(section.data.eyebrow)}</div>
        <div>
          <h1>${escapeHtml(weddingData.event.title)}</h1>
          <p class="hero__lede">${escapeHtml(weddingData.event.subtitle)}</p>
        </div>
        <div class="hero__meta">
          <div class="meta-card">
            <span class="eyebrow">Fecha</span>
            <strong>${escapeHtml(section.data.dateLabel)}</strong>
            <span>${escapeHtml(formatDate(weddingData.event.eventDate))}</span>
          </div>
          <div class="meta-card">
            <span class="eyebrow">Ciudad</span>
            <strong>${escapeHtml(weddingData.event.city)}</strong>
            <span>Invitacion renderizada desde datos estructurados</span>
          </div>
          <div class="meta-card">
            <span class="eyebrow">Token</span>
            <strong>URL sin login</strong>
            <span>Lista para evolucionar a invitacion unica por grupo.</span>
          </div>
          <div class="meta-card">
            <span class="eyebrow">RSVP</span>
            <strong>Confirmacion por grupo</strong>
            <span>Estado mutable antes y despues del envio.</span>
          </div>
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
      <aside class="hero__poster" aria-label="Composicion editorial de boda">
        <div class="poster-frame"></div>
      </aside>
    </section>
  `;
}

function renderNarrative(section) {
  return `
    <section class="section" id="historia">
      <div class="section__header">
        <span class="eyebrow">Narrativa</span>
        <h2>${escapeHtml(section.data.title)}</h2>
        <p>${escapeHtml(section.data.description)}</p>
      </div>
      <div class="narrative-grid">
        <div class="quote-block">
          <blockquote>${escapeHtml(section.data.quote)}</blockquote>
        </div>
        <div class="narrative-details">
          ${section.data.parents.map((item) => `<div>${escapeHtml(item)}</div>`).join("")}
        </div>
      </div>
      <div class="gallery">
        ${section.data.gallery
          .map((item) => `<div class="gallery__item" aria-label="${escapeHtml(item)}"></div>`)
          .join("")}
      </div>
    </section>
  `;
}

function renderTimeline(section) {
  return `
    <section class="section" id="itinerario">
      <div class="section__header">
        <span class="eyebrow">Logistica</span>
        <h2>${escapeHtml(section.data.title)}</h2>
        <p>${escapeHtml(section.data.description)}</p>
      </div>
      <div class="timeline">
        ${section.data.items
          .map(
            (item) => `
              <article class="timeline-item">
                <div class="timeline-item__time">${escapeHtml(item.time)}</div>
                <div>
                  <span class="timeline-item__title">${escapeHtml(item.name)}</span>
                  <div class="timeline-item__meta">${escapeHtml(item.venue)}</div>
                </div>
                <a class="timeline-item__link" href="${escapeHtml(item.mapsUrl)}" target="_blank" rel="noreferrer">Ver mapa</a>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderDressCode(section) {
  return `
    <section class="section" id="dress-code">
      <div class="section__header">
        <span class="eyebrow">Estilo</span>
        <h2>${escapeHtml(section.data.title)}</h2>
        <p>${escapeHtml(section.data.description)}</p>
      </div>
      <div class="dress-code">
        <div>
          <p>${escapeHtml(section.data.guidance)}</p>
          <div class="swatch-list">
            ${section.data.palette
              .map((color) => `<span class="swatch" style="background:${escapeHtml(color)}"></span>`)
              .join("")}
          </div>
        </div>
        <div class="narrative-details">
          ${section.data.links
            .map(
              (link) => `
                <a class="timeline-item__link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">
                  ${escapeHtml(link.label)}
                </a>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderLodging(section) {
  return `
    <section class="section" id="hospedaje">
      <div class="section__header">
        <span class="eyebrow">Fin de semana</span>
        <h2>${escapeHtml(section.data.title)}</h2>
        <p>${escapeHtml(section.data.description)}</p>
      </div>
      <div class="lodging-carousel">
        ${section.data.items
          .map(
            (item) => `
              <article class="lodging-card">
                <span class="eyebrow">${escapeHtml(item.distance)}</span>
                <span class="lodging-card__name">${escapeHtml(item.name)}</span>
                <div>${escapeHtml(item.details)}</div>
                <a class="lodging-card__action" href="${escapeHtml(item.actionUrl)}" target="_blank" rel="noreferrer">
                  ${escapeHtml(item.actionLabel)}
                </a>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderRegistry(section) {
  return `
    <section class="section" id="regalos">
      <div class="section__header">
        <span class="eyebrow">Regalos</span>
        <h2>${escapeHtml(section.data.title)}</h2>
        <p>${escapeHtml(section.data.description)}</p>
      </div>
      <div class="registry-list">
        ${section.data.items
          .map((item) => {
            let action = "";
            if (item.kind === "link") {
              action = `<a class="registry-item__action" href="${escapeHtml(item.actionUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.actionLabel)}</a>`;
            }
            if (item.kind === "copy") {
              action = `<button class="copy-button" type="button" data-copy="${escapeHtml(item.copyValue)}">${escapeHtml(item.actionLabel)}</button>`;
            }
            return `
              <article class="registry-item">
                <span class="registry-item__title">${escapeHtml(item.title)}</span>
                <div>${escapeHtml(item.detail)}</div>
                ${action}
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderFinalNotes(section) {
  return `
    <section class="section" id="indicaciones">
      <div class="section__header">
        <span class="eyebrow">Antes del gran dia</span>
        <h2>${escapeHtml(section.data.title)}</h2>
      </div>
      <div class="final-notes">
        ${section.data.notes.map((note) => `<div class="final-note">${escapeHtml(note)}</div>`).join("")}
      </div>
    </section>
  `;
}

function renderStatus(group) {
  const state = getInvitationState(group);
  return `
    <section class="status-strip ${state.isConfirmed ? "status-strip--confirmed" : ""}">
      <div>
        <div class="eyebrow">Grupo invitado</div>
        <strong>${escapeHtml(group.label)}</strong>
        <div>${state.isConfirmed ? "Tu respuesta ya fue registrada." : "Aun no hemos recibido tu confirmacion."}</div>
      </div>
      <div>
        <div class="eyebrow">Token</div>
        <strong>${escapeHtml(group.token)}</strong>
      </div>
    </section>
  `;
}

function renderRsvp(section, group) {
  const state = getInvitationState(group);
  const summary = state.isConfirmed
    ? `<div class="rsvp-summary"><div>Gracias por responder.</div><div>Ultimo envio: ${escapeHtml(formatDate(group.rsvpSubmittedAt))}</div></div>`
    : "";

  return `
    <section class="section rsvp" id="rsvp">
      <div class="section__header">
        <span class="eyebrow">RSVP</span>
        <h2>${escapeHtml(section.data.title)}</h2>
        <p>${escapeHtml(section.data.description)}</p>
      </div>
      ${summary}
      <div class="rsvp__intro">
        Confirma por favor a nombre del grupo completo. Cada persona tiene su propio estado y, si asiste, su preferencia de comida.
      </div>
      <form id="rsvp-form" novalidate>
        <div class="rsvp-group">
          ${group.members
            .map((member) => {
              const meals =
                member.attendance === true && section.data.allowDietaryPreferences
                  ? `
                    <div class="meal-options">
                      ${section.data.dietaryOptions
                        .map(
                          (option) => `
                            <label class="pill-radio">
                              <input type="radio" name="meal-${member.id}" value="${escapeHtml(option)}" ${member.mealPreference === option ? "checked" : ""} />
                              <span>${escapeHtml(option)}</span>
                            </label>
                          `
                        )
                        .join("")}
                    </div>
                    <div class="field">
                      <label for="allergies-${member.id}">Alergias o nota especial</label>
                      <input id="allergies-${member.id}" name="allergies-${member.id}" value="${escapeHtml(member.allergies)}" placeholder="Solo si impacta la operacion del evento" />
                    </div>
                  `
                  : "";

              return `
                <article class="rsvp-person">
                  <div>
                    <span class="rsvp-person__name">${escapeHtml(member.fullName)}</span>
                    <div class="eyebrow">Confirmacion individual</div>
                  </div>
                  <div class="attendance-toggle">
                    <label class="pill-radio">
                      <input type="radio" name="attendance-${member.id}" value="yes" ${member.attendance === true ? "checked" : ""} />
                      <span>Asistire</span>
                    </label>
                    <label class="pill-radio">
                      <input type="radio" name="attendance-${member.id}" value="no" ${member.attendance === false ? "checked" : ""} />
                      <span>No podre asistir</span>
                    </label>
                  </div>
                  ${meals}
                </article>
              `;
            })
            .join("")}
        </div>
        <div class="rsvp-actions">
          <button class="button" type="submit">${state.isConfirmed ? "Actualizar confirmacion" : "Enviar confirmacion"}</button>
          <button class="button--ghost" type="button" id="reset-rsvp">Restablecer demo</button>
        </div>
        <div class="feedback" id="feedback">${escapeHtml(feedbackState.message)}</div>
      </form>
    </section>
  `;
}

function renderFooter() {
  return `
    <div class="footer-note">
      <div>Arquitectura actual: evento + presentacion + secciones + grupo invitado con token.</div>
      <div>Lista para cambiar la fuente de datos a una API real sin romper el template.</div>
    </div>
  `;
}

function renderInvitation(group) {
  const markup = weddingData.sections
    .filter((section) => section.enabled)
    .map((section) => {
      if (section.type === "hero") return renderHero(section);
      if (section.type === "narrative") return renderNarrative(section);
      if (section.type === "timeline") return renderTimeline(section);
      if (section.type === "dress-code") return renderDressCode(section);
      if (section.type === "lodging") return renderLodging(section);
      if (section.type === "registry") return renderRegistry(section);
      if (section.type === "final-notes") return renderFinalNotes(section);
      if (section.type === "rsvp") return renderRsvp(section, group);
      return "";
    })
    .join("");

  app.innerHTML = `${markup}${renderStatus(group)}${renderFooter()}`;
}

function updateCountdown() {
  const container = document.querySelector("#countdown");
  if (!container) return;
  const diff = Math.max(new Date(weddingData.event.eventDate).getTime() - Date.now(), 0);
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

function syncFeedback() {
  const feedback = document.querySelector("#feedback");
  if (feedback) feedback.textContent = feedbackState.message;
}

function attachCopyHandlers() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy") ?? "";
      try {
        await navigator.clipboard.writeText(value);
        feedbackState.message = "Datos copiados al portapapeles.";
      } catch {
        feedbackState.message = "No fue posible copiar automaticamente.";
      }
      syncFeedback();
    });
  });
}

function rerender(group) {
  renderInvitation(group);
  attachCopyHandlers();
  bindForm(group);
  updateCountdown();
}

function bindForm(group) {
  const form = document.querySelector("#rsvp-form");
  const reset = document.querySelector("#reset-rsvp");
  if (!form || !reset) return;

  form.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const match = target.name.match(/^(attendance|meal|allergies)-(.+)$/);
    if (!match) return;
    const [, field, memberId] = match;
    const member = group.members.find((item) => item.id === memberId);
    if (!member) return;

    if (field === "attendance") {
      member.attendance = target.value === "yes";
      if (member.attendance === false) {
        member.mealPreference = "";
        member.allergies = "";
      }
      saveGuestGroup(group);
      rerender(group);
      return;
    }

    if (field === "meal") {
      member.mealPreference = target.value;
      saveGuestGroup(group);
      return;
    }
  });

  form.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    const match = target.name.match(/^allergies-(.+)$/);
    if (!match) return;
    const [, memberId] = match;
    const member = group.members.find((item) => item.id === memberId);
    if (!member) return;
    member.allergies = target.value;
    saveGuestGroup(group);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const incomplete = group.members.some((member) => {
      if (member.attendance === null) return true;
      if (member.attendance === true && getRsvpConfig().allowDietaryPreferences) {
        return !member.mealPreference;
      }
      return false;
    });

    if (incomplete) {
      feedbackState.message = "Completa la asistencia y, si aplica, la preferencia de comida de cada persona.";
      syncFeedback();
      return;
    }

    group.rsvpSubmittedAt = new Date().toISOString();
    saveGuestGroup(group);
    feedbackState.message = "Confirmacion enviada con exito.";
    rerender(group);
  });

  reset.addEventListener("click", () => {
    const fresh = clone(weddingData.guestGroups[group.token]);
    saveGuestGroup(fresh);
    feedbackState.message = "La demo fue restablecida.";
    rerender(fresh);
  });
}

function bootstrap() {
  const group = loadGuestGroup();
  rerender(group);
  window.setInterval(updateCountdown, 1000);
}

bootstrap();
