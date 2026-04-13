# Invitacion dinamica de boda

Micrositio mobile-first que:

- lee el contenido desde `.env`
- sirve fotos locales desde `./uploads`
- guarda las respuestas RSVP en `./data`
- corre dentro de Docker

## Uso recomendado

```bash
docker compose up --build -d
```

Abre `http://localhost:8080`.

## Si editas contenido

1. Cambia el archivo `.env`
2. Agrega o reemplaza fotos en `./uploads`
3. Reinicia:

```bash
docker compose up --build -d
```

## RSVP guardado

Cuando alguien envia la confirmacion, se generan:

- `data/rsvp-submissions.txt`
- `data/rsvp-submissions.ndjson`
