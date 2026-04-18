FROM node:20-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY src /app/src
COPY public /app/public
COPY .env /app/.env
COPY storage /app/storage

EXPOSE 8080

CMD ["node", "src/server.js"]
