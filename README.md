# Invitacion dinamica de boda

Micrositio mobile-first con dos experiencias:

- sitio publico en `/`
- sitio publico personalizado en `/invite/:token`
- panel administrativo en `/admin`
- fotos locales en `./storage/uploads`
- configuracion persistida en `./storage/data/invitation-config.json`
- RSVP guardado en `./storage/data`
- ejecucion simple dentro de Docker

## Estructura

- `src/`: servidor Node
- `public/`: HTML, CSS y JS publico
- `public/admin.*`: panel administrativo
- `public/admin-invitation.*`: editor legado de la invitacion, ahora embebido dentro de la vista `Invitacion`
- `storage/uploads/`: fotos locales
- `storage/data/`: respuestas RSVP, configuracion persistente y store de invitados
- `sandbox/`: prototipos o variantes no activas
- `ops/`: configuracion operativa

## Uso recomendado

```bash
docker compose up --build -d
```

Abre:

- `http://localhost:8080` para la invitacion publica
- `http://localhost:8080/invite/<token>` para una invitacion personalizada
- `http://localhost:8080/admin` para el panel

## Flujo de edicion

1. La primera vez, si no existe `storage/data/invitation-config.json`, el sistema lo crea usando `.env` como semilla inicial.
2. Desde ese momento, la invitacion publica y `/admin` leen la configuracion persistida.
3. Los cambios del panel se reflejan sin rebuild ni reinicio del contenedor.
4. El `.env` queda para configuracion tecnica, defaults de arranque y credenciales opcionales del admin.

## Seguridad opcional del admin

Puedes proteger `/admin` y `/api/admin/*` definiendo estas variables en `.env`:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Si no se definen, el panel queda sin autenticacion.

## Imagenes y contenido

- Agrega o reemplaza fotos en `./storage/uploads`
- Usa rutas como `/uploads/hero.jpg` desde el panel
- Si quieres reiniciar el contenido editable a la semilla inicial, usa el boton `Restaurar semilla` del panel

## RSVP guardado

Cuando alguien envia la confirmacion, se generan:

- `storage/data/rsvp-submissions.txt`
- `storage/data/rsvp-submissions.ndjson`
- `storage/data/guest-portal.json`
- `storage/data/guest-rsvp-history.ndjson`
- `storage/data/guest-send-jobs.ndjson`
