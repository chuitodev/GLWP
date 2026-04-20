# Prompt de implementacion: panel web para editar la invitacion

## Contexto actual del proyecto

Este proyecto `GLWP` es una invitacion de boda servida por una app Node simple.

- Backend actual: `src/server.js`
- Frontend publico: `public/index.html`, `public/main.js`, `public/styles.css`
- Docker: `Dockerfile`, `docker-compose.yml`
- Fuente de verdad actual: archivo `.env`
- Persistencia actual existente: `storage/data` para RSVP y `storage/uploads` para imagenes

Hoy la invitacion se arma completamente desde `process.env` a traves de `buildConfig()` en `src/server.js`, y se expone en `GET /api/config`.

La peticion es:

- No editar el `.env` desde la web
- No depender del `.env` como origen editable principal para la invitacion
- Crear un nuevo feature para administrar la invitacion desde una pagina web aparte
- Esa pagina debe correr tambien dentro de Docker y quedar accesible en la misma aplicacion web

## Objetivo funcional

Implementa un panel de administracion web separado para editar la configuracion de la invitacion directamente desde la interfaz.

La invitacion publica debe seguir funcionando, pero en lugar de leer el contenido editable desde `.env`, debe leerlo desde una fuente persistente propia del sistema, por ejemplo:

- `storage/data/invitation-config.json`

o una estructura equivalente si propones otra mejor opcion, siempre que:

- sea persistente en Docker
- viva en `storage/data` o en otro volumen persistente equivalente
- no requiera reiniciar el contenedor para ver los cambios
- no escriba de vuelta al `.env`

## Resultado esperado

Quiero dos experiencias separadas:

1. Sitio publico de invitacion
2. Pagina administrativa para editar contenido

Ejemplo de rutas aceptables:

- `/` para la invitacion publica
- `/admin` para el panel de edicion

## Requisito clave de arquitectura

Refactoriza el proyecto para que exista una capa de configuracion persistente de invitacion.

El `.env` debe quedar solo para configuracion tecnica o defaults de arranque, no como CMS manual.

La invitacion publica debe consumir la configuracion persistida.
El panel administrativo debe leer y guardar esa misma configuracion persistida.

## Todo lo que hoy se configura desde `.env` y debe poder editarse desde la interfaz

Migra a la nueva fuente editable todos estos grupos de datos:

### 1. Identidad general

- `BRAND_LABEL`
- `TOPBAR_ACTION_LABEL`

### 2. Tema visual

- `THEME_COLOR_BACKGROUND`
- `THEME_COLOR_BACKGROUND_STRONG`
- `THEME_COLOR_BACKGROUND_END`
- `THEME_COLOR_SURFACE`
- `THEME_COLOR_SURFACE_STRONG`
- `THEME_COLOR_BORDER`
- `THEME_COLOR_TEXT`
- `THEME_COLOR_TEXT_MUTED`
- `THEME_COLOR_TITLE`
- `THEME_COLOR_PRIMARY`
- `THEME_COLOR_PRIMARY_SOFT`
- `THEME_COLOR_PRIMARY_TEXT`
- `THEME_COLOR_HERO_TEXT`
- `THEME_COLOR_SUCCESS`
- `THEME_HERO_GRADIENT_START`
- `THEME_HERO_GRADIENT_MID`
- `THEME_HERO_GRADIENT_END`

### 3. Datos de la pareja y hero

- `BRIDE_NAME`
- `GROOM_NAME`
- `COUPLE_DISPLAY_NAME`
- `HERO_EYEBROW`
- `HERO_SUBTITLE`
- `HERO_PHOTO`
- `HERO_PHOTO_ALT`
- `EVENT_DATE`
- `EVENT_TIMEZONE`
- `EVENT_CITY`

### 4. Padres y galeria

- `PARENTS_SECTION_TITLE`
- `PARENTS_SECTION_TEXT`
- `GROOM_PARENTS_TITLE`
- `GROOM_PARENTS_NAMES`
- `BRIDE_PARENTS_TITLE`
- `BRIDE_PARENTS_NAMES`
- `STORY_PHOTO_1`
- `STORY_PHOTO_1_ALT`
- `STORY_PHOTO_2`
- `STORY_PHOTO_2_ALT`
- `STORY_PHOTO_3`
- `STORY_PHOTO_3_ALT`

### 5. Itinerario

Actualmente depende de:

- `TIMELINE_TITLE`
- `TIMELINE_DESCRIPTION`
- `TIMELINE_COUNT`
- `TIMELINE_1_*`, `TIMELINE_2_*`, `TIMELINE_3_*`, etc.

Esto debe convertirse a una lista editable dinamica desde UI, con acciones para:

- agregar item
- editar item
- eliminar item
- reordenar item

Campos por item:

- `label`
- `time`
- `venue`
- `address`
- `mapsUrl`

### 6. Dress code

- `DRESS_TITLE`
- `DRESS_DESCRIPTION`
- `DRESS_GUIDANCE`
- `DRESS_PALETTE`
- `DRESS_LINK_COUNT`
- `DRESS_LINK_n_LABEL`
- `DRESS_LINK_n_URL`

Tambien debe pasar a lista dinamica editable para links.
La paleta puede guardarse como arreglo real en JSON, no como string separado por comas.

### 7. Hospedaje

Actualmente depende de:

- `LODGING_TITLE`
- `LODGING_DESCRIPTION`
- `LODGING_COUNT`
- `LODGING_n_*`

Debe convertirse a lista dinamica editable con:

- `minutes`
- `name`
- `address`
- `mapsUrl`

### 8. Mesa de regalos

Actualmente depende de:

- `REGISTRY_TITLE`
- `REGISTRY_DESCRIPTION`
- `REGISTRY_COUNT`
- `REGISTRY_n_*`

Debe convertirse a lista dinamica editable con:

- `title`
- `description`
- `details` como arreglo de lineas
- `actionLabel`
- `actionUrl`
- `copyValue`

### 9. Indicaciones finales

Actualmente depende de:

- `NOTES_TITLE`
- `NOTE_COUNT`
- `NOTE_1`, `NOTE_2`, etc.

Debe convertirse a lista dinamica editable de notas.

### 10. RSVP configurable

- `RSVP_TITLE`
- `RSVP_DESCRIPTION`
- `RSVP_GROUP_NAME`
- `RSVP_DIETARY_QUESTION`
- `RSVP_DIETARY_OPTIONS`
- `GUEST_COUNT`
- `GUEST_n_NAME`

Debe convertirse a:

- campos editables simples
- lista dinamica de invitados
- lista dinamica de opciones alimentarias

## Requisitos tecnicos

### Persistencia

Implementa una capa clara para leer y guardar configuracion, por ejemplo:

- `src/lib/config-store.js`

Responsabilidades:

- cargar configuracion persistida
- si no existe, inicializarla desde el `.env` actual una sola vez
- normalizar estructura
- validar datos basicos
- guardar cambios de forma atomica

Importante:

- Si no existe el archivo persistido, se puede usar el `.env` solo como semilla inicial
- Despues de creada la configuracion persistida, los cambios desde UI deben vivir ahi
- No editar `.env`

### API

Agrega endpoints separados para administracion, por ejemplo:

- `GET /api/config`
- `GET /api/admin/config`
- `PUT /api/admin/config`

Opcionalmente puedes dividir por secciones, pero sin sobrecomplicar si no hace falta.

Requisitos:

- `GET /api/config` debe devolver la configuracion publica ya normalizada
- `GET /api/admin/config` debe devolver la configuracion completa editable
- `PUT /api/admin/config` debe validar y persistir

Si lo consideras adecuado, agrega un endpoint de health o metadata.

### Seguridad minima

Si puedes implementarlo sin romper simplicidad, protege `/admin` y `/api/admin/*` con autenticacion basica sencilla usando credenciales por `.env`, por ejemplo:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Si no se implementa autenticacion, deja la estructura preparada y documenta claramente el riesgo.

### Frontend administrativo

Crea una pagina administrativa separada, sin frameworks pesados si no hacen falta, consistente con la arquitectura actual.

Archivos sugeridos:

- `public/admin.html`
- `public/admin.js`
- `public/admin.css`

Requisitos del panel:

- cargar configuracion actual
- editar todas las secciones
- guardar cambios sin reiniciar contenedor
- feedback visual de guardado
- formularios claros por seccion
- soporte para listas dinamicas
- botones para agregar, eliminar y reordenar items
- usar `storage/uploads` como convencion existente para imagenes

No hace falta que la pagina admin edite archivos de imagen. Basta con permitir capturar la ruta de imagen, aunque si puedes agregar upload web de archivos a `storage/uploads`, seria una mejora valiosa.

### Compatibilidad con Docker

Actualiza lo necesario para que el feature funcione montado en Docker.

Consideraciones:

- el archivo persistido de configuracion debe sobrevivir reinicios
- debe quedar dentro de un volumen montado
- no debe requerir rebuild para cada cambio de contenido

Si hace falta, ajusta:

- `docker-compose.yml`
- `Dockerfile`

Pero manteniendo el proyecto simple.

## Refactor esperado en backend

Actualmente `buildConfig()` construye todo desde `env()`.

Refactoriza para:

1. separar defaults/seed desde `.env`
2. separar lectura de configuracion persistida
3. usar estructuras JSON reales en lugar de `COUNT` + claves numeradas

Ejemplo de estructura deseable:

```json
{
  "brandLabel": "GLWP INVITATION SYSTEM",
  "topbarActionLabel": "Ir a RSVP",
  "theme": {},
  "couple": {},
  "hero": {},
  "parents": {
    "galleryPhotos": []
  },
  "timeline": {
    "items": []
  },
  "dressCode": {
    "palette": [],
    "links": []
  },
  "lodging": {
    "items": []
  },
  "registry": {
    "items": []
  },
  "notes": {
    "items": []
  },
  "rsvp": {
    "dietaryOptions": [],
    "guests": []
  }
}
```

## UX esperada del admin

La pagina `/admin` debe sentirse como un pequeño CMS interno de esta invitacion.

Secciones sugeridas:

- General
- Tema
- Hero
- Padres y galeria
- Itinerario
- Dress code
- Hospedaje
- Mesa de regalos
- Indicaciones finales
- RSVP

Cada seccion debe tener guardado claro, o un guardado general al final.
Prefiero simplicidad y robustez sobre complejidad visual.

## Compatibilidad hacia atras

No rompas el sitio publico actual.

Objetivo:

- si existe configuracion persistida, usarla
- si no existe, generar una inicial a partir del `.env`
- la invitacion publica debe seguir renderizando lo mismo o casi lo mismo que hoy

## Limpieza de textos heredados

Actualiza textos del frontend que hoy dicen cosas como:

- "Estamos leyendo el archivo .env..."
- "Esta version lee el contenido desde .env..."
- descripciones que indican que hospedaje o itinerario se editan en el `.env`

Esos textos deben reflejar el nuevo modelo con panel administrativo.

## Entregables

Realiza los cambios de codigo necesarios y deja:

1. panel administrativo funcional
2. persistencia real de configuracion
3. invitacion publica consumiendo esa persistencia
4. compatibilidad con Docker
5. README actualizado con el nuevo flujo de edicion

## Criterios de aceptacion

- Puedo abrir la invitacion publica en web
- Puedo abrir `/admin` en web
- Puedo editar desde `/admin` el contenido que antes vivia en `.env`
- Los cambios se reflejan en la invitacion sin rebuild del contenedor
- Los cambios persisten al reiniciar Docker
- El `.env` no se modifica desde la pagina
- El sistema sigue guardando RSVP en `storage/data`

## Extras recomendados si el alcance lo permite

- boton "Vista previa" desde admin
- boton "Restaurar desde semilla inicial"
- validaciones visuales para URLs, colores y fecha
- upload de imagenes a `storage/uploads`
- autenticacion basica para admin

## Importante

Haz una implementacion pragmatica y mantenible. No conviertas este proyecto en algo sobredimensionado. La prioridad es que el usuario pueda gestionar toda la invitacion desde una pagina web separada, sin tocar `.env`, y que eso funcione correctamente en Docker y en produccion web.
