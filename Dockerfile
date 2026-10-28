FROM node:22-slim AS web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
COPY lib ./lib
COPY skills ./skills
COPY playbooks ./playbooks
COPY --from=web /app/frontend/dist ./frontend/dist
USER node
EXPOSE 8080
CMD ["node", "server.js"]
