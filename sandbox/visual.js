const weddingData = {
  event: {
    title: "Camila & Julian",
    subtitle: "Una celebracion para bailar, abrazar y volver a enamorarnos de la vida juntos.",
    timezone: "America/Mexico_City",
    eventDate: "2026-11-21T17:00:00-06:00",
    city: "San Miguel de Allende, Guanajuato",
  },
  sections: [
    { type: "hero", enabled: true, data: { eyebrow: "Nos casamos", dateLabel: "21 Noviembre 2026" } },
    {
      type: "narrative",
      enabled: true,
      data: {
        title: "Nuestra historia, contada con calma",
        description: "Queremos que esta invitacion se sienta como la antesala del dia: intima, clara y profundamente nuestra.",
        quote: "Despues de tantos viajes, sobremesas y planes compartidos, elegimos reunir a quienes mas queremos para celebrar el comienzo de esta nueva etapa.",
        parents: ["Con el amor de Martha y Roberto", "Y la bendicion de Elena y Fernando"],
        gallery: ["Atardecer", "Carta", "Flores"],
      },
    },
    {
      type: "timeline",
      enabled: true,
      data: {
        title: "Itinerario",
        description: "Cada bloque del evento se presenta como un momento claro, elegante y facil de escanear desde movil.",
        items: [
          { name: "Ceremonia civil", time: "17:00", venue: "Huerto del Angel", mapsUrl: "https://maps.google.com/" },
          { name: "Coctel al atardecer", time: "18:30", venue: "Jardin de los Naranjos", mapsUrl: "https://maps.google.com/" },
          { name: "Cena y recepcion", time: "20:00", venue: "Casa Adela", mapsUrl: "https://maps.google.com/" },
          { name: "After", time: "23:45", venue: "Patio de Luz", mapsUrl: "https://maps.google.com/" },
        ],
      },
    },
    {
      type: "dress-code",
      enabled: true,
      data: {
        title: "Dress code",
        description: "Formal contemporaneo. Queremos una noche elegante, fresca y luminosa.",
        guidance: "Sugerimos tonos tierra, marfil, negro profundo o verdes secos. Evitar blanco pleno.",
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
        description: "Las opciones se muestran como tarjetas deslizables para reforzar el gesto de carrusel en movil.",
        items: [
          { name: "Casa Noa", distance: "6 min del evento", details: "Boutique hotel, desayuno incluido.", actionLabel: "Reservar", actionUrl: "https://example.com/" },
          { name: "Patio Escondido", distance: "9 min del evento", details: "Tarifa preferencial con codigo CAMIYJULI.", actionLabel: "Ver tarifa", actionUrl: "https://example.com/" },
          { name: "Casa del Centro", distance: "12 min del evento", details: "Ideal para extender el fin de semana.", actionLabel: "Abrir sitio", actionUrl: "https://example.com/" },
        ],
      },
    },
    {
      type: "registry",
      enabled: true,
      data: {
        title: "Mesa de regalos",
        description: "Mostramos distintas formas de regalar sin activar aun ninguna logica funcional.",
        items: [
          { title: "Liverpool", detail: "Mesa digital con envios y pagos seguros.", actionLabel: "Abrir mesa" },
          { title: "Lluvia de sobres", detail: "Tendremos un espacio para recibir detalles libres." },
          { title: "Transferencia bancaria", detail: "CLABE: 0123 4567 8910 1112 131", actionLabel: "Copiar datos" },
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
          "Si necesitas apoyo especial de movilidad, avisanos con anticipacion.",
        ],
      },
    },
    {
      type: "rsvp",
      enabled: true,
      data: {
        title: "Confirmacion de asistencia",
        description: "Este bloque representa visualmente el RSVP por grupo, pero aun no ejecuta logica de guardado ni validacion.",
        guests: [
          { name: "Ana Garcia", meal: "Vegetariano" },
          { name: "Luis Lopez", meal: "Estandar" },
        ],
      },
    },
  ],
};

const app = document.querySelector("#app");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: weddingData.event.timezone,
  }).format(new Date(dateString));
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
            <span>Experiencia mobile-first abierta desde WhatsApp</span>
          </div>
          <div class="meta-card">
            <span class="eyebrow">Template</span>
            <strong>Editorial sunset</strong>
            <span>Diseno visual listo para reemplazar el contenido estructurado.</span>
          </div>
          <div class="meta-card">
            <span class="eyebrow">Estado</span>
            <strong>Prototipo visual</strong>
            <span>Sin funciones reales de backend en esta etapa.</span>
          </div>
        </div>
        <div class="hero__actions">
          <a class="button" href="#rsvp">Ver RSVP</a>
          <a class="button--ghost" href="#itinerario">Ver itinerario</a>
        </div>
        <div class="countdown" id="countdown">
          ${["Dias", "Horas", "Min", "Seg"].map((label) => `
            <div class="countdown__item">
              <div class="countdown__value">00</div>
              <div>${label}</div>
            </div>
          `).join("")}
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
        ${section.data.gallery.map((item) => `<div class="gallery__item" aria-label="${escapeHtml(item)}"></div>`).join("")}
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
        ${section.data.items.map((item) => `
          <article class="timeline-item">
            <div class="timeline-item__time">${escapeHtml(item.time)}</div>
            <div>
              <span class="timeline-item__title">${escapeHtml(item.name)}</span>
              <div class="timeline-item__meta">${escapeHtml(item.venue)}</div>
            </div>
            <a class="timeline-item__link" href="${escapeHtml(item.mapsUrl)}" target="_blank" rel="noreferrer">Ver mapa</a>
          </article>
        `).join("")}
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
            ${section.data.palette.map((color) => `<span class="swatch" style="background:${escapeHtml(color)}"></span>`).join("")}
          </div>
        </div>
        <div class="narrative-details">
          ${section.data.links.map((link) => `
            <a class="timeline-item__link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>
          `).join("")}
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
        ${section.data.items.map((item) => `
          <article class="lodging-card">
            <span class="eyebrow">${escapeHtml(item.distance)}</span>
            <span class="lodging-card__name">${escapeHtml(item.name)}</span>
            <div>${escapeHtml(item.details)}</div>
            <a class="lodging-card__action" href="${escapeHtml(item.actionUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.actionLabel)}</a>
          </article>
        `).join("")}
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
        ${section.data.items.map((item) => `
          <article class="registry-item">
            <span class="registry-item__title">${escapeHtml(item.title)}</span>
            <div>${escapeHtml(item.detail)}</div>
            ${item.actionLabel ? `<span class="registry-item__action">${escapeHtml(item.actionLabel)}</span>` : ""}
          </article>
        `).join("")}
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

function renderRsvp(section) {
  return `
    <section class="section rsvp" id="rsvp">
      <div class="section__header">
        <span class="eyebrow">RSVP</span>
        <h2>${escapeHtml(section.data.title)}</h2>
        <p>${escapeHtml(section.data.description)}</p>
      </div>
      <div class="status-strip">
        <div>
          <div class="eyebrow">Grupo invitado</div>
          <strong>Familia Garcia Lopez</strong>
          <div>Vista demostrativa del bloque de confirmacion por grupo.</div>
        </div>
        <div>
          <div class="eyebrow">Estado</div>
          <strong>Pendiente</strong>
        </div>
      </div>
      <div class="rsvp-group">
        ${section.data.guests.map((guest) => `
          <article class="rsvp-person">
            <div>
              <span class="rsvp-person__name">${escapeHtml(guest.name)}</span>
              <div class="eyebrow">Confirmacion individual</div>
            </div>
            <div class="attendance-toggle">
              <label class="pill-radio">
                <input type="radio" disabled />
                <span>Asistire</span>
              </label>
              <label class="pill-radio">
                <input type="radio" disabled />
                <span>No podre asistir</span>
              </label>
            </div>
            <div class="meal-options">
              <label class="pill-radio">
                <input type="radio" checked disabled />
                <span>${escapeHtml(guest.meal)}</span>
              </label>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="rsvp-actions">
        <button class="button" type="button" disabled>Enviar confirmacion</button>
        <span class="feedback">Prototipo visual sin funcionalidad activa.</span>
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <div class="footer-note">
      <div>Base visual pensada como micrositio configurable por secciones.</div>
      <div>El siguiente paso seria conectar estos bloques a datos reales cuando lo necesites.</div>
    </div>
  `;
}

function renderInvitation() {
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
      if (section.type === "rsvp") return renderRsvp(section);
      return "";
    })
    .join("");

  app.innerHTML = `${markup}${renderFooter()}`;
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

renderInvitation();
updateCountdown();
window.setInterval(updateCountdown, 1000);
