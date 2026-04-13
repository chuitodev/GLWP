FROM node:20-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY server.js /app/server.js
COPY index.html /app/index.html
COPY styles.css /app/styles.css
COPY main.js /app/main.js
COPY .env /app/.env
COPY uploads /app/uploads
COPY data /app/data

EXPOSE 8080

CMD ["node", "server.js"]
