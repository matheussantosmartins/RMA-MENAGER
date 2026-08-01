# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# ---- deps: instala TODAS as dependencias (dev incluso) para build/typecheck ----
FROM base AS deps
# Necessario para o "prisma generate" (postinstall) validar o schema corretamente nesta etapa.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY backend/prisma backend/prisma
RUN npm ci

# ---- build: compila o backend TypeScript -> dist ----
FROM deps AS build
COPY tsconfig.base.json ./tsconfig.base.json
COPY backend ./backend
RUN npm run build --workspace backend

# ---- runtime: apenas dependencias de producao + artefatos compilados ----
FROM base AS runtime
ENV NODE_ENV=production
# Necessario apenas para o "prisma generate" (postinstall) validar o schema; sobrescrito em runtime pelo compose.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY backend/prisma backend/prisma
RUN npm ci --omit=dev

COPY --from=build /app/backend/dist ./backend/dist
COPY backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
RUN sed -i 's/\r$//' ./backend/docker-entrypoint.sh \
  && chmod +x ./backend/docker-entrypoint.sh \
  && mkdir -p /app/backend/uploads \
  && chown -R node:node /app

WORKDIR /app/backend
USER node

EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://localhost:4000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
