FROM node:20-alpine

WORKDIR /app

COPY package*.json /app/
RUN npm install --omit=dev
COPY src /app/src
COPY public /app/public
COPY storage /app/storage
COPY .env /app/.env

EXPOSE 8080

CMD ["node", "src/server.js"]
