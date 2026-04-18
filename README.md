# Invitacion dinamica de boda

Micrositio mobile-first que:

- lee el contenido desde `.env`
- sirve fotos locales desde `./storage/uploads`
- guarda las respuestas RSVP en `./storage/data`
- corre dentro de Docker

## Estructura

- `src/`: servidor Node
- `public/`: HTML, CSS y JS publico
- `storage/uploads/`: fotos locales
- `storage/data/`: respuestas RSVP y archivos persistentes
- `sandbox/`: prototipos o variantes no activas
- `ops/`: configuracion operativa

## Uso recomendado

```bash
docker compose up --build -d
```

Abre `http://localhost:8080`.

## Si editas contenido

1. Cambia el archivo `.env`
2. Agrega o reemplaza fotos en `./storage/uploads`
3. Reinicia:

```bash
docker compose up --build -d
```

## RSVP guardado

Cuando alguien envia la confirmacion, se generan:

- `storage/data/rsvp-submissions.txt`
- `storage/data/rsvp-submissions.ndjson`
