# Connect Maratha API image. Build context is the repository root:
#   docker compose -f deploy/docker-compose.prod.yml build
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# backend/ imports ../database/database.js, so both folders keep their layout.
COPY backend/package.json backend/
COPY database/package.json database/
RUN npm install --omit=dev --prefix backend \
 && npm install --omit=dev --prefix database \
 && npm cache clean --force

COPY backend/ backend/
COPY database/ database/

USER node
EXPOSE 5000
CMD ["node", "backend/server.js"]
