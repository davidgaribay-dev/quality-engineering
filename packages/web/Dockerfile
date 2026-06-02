# syntax=docker/dockerfile:1
# Build from the REPO ROOT (needs the @org/contracts sibling):
#   docker build -f packages/web/Dockerfile -t qe-web .
ARG NODE_VERSION=lts-alpine

# ---- Build the SPA with Vite ----
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package*.json ./
COPY packages/web/package.json       packages/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/api/package.json       packages/api/package.json
COPY packages/e2e/package.json       packages/e2e/package.json
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.base.json ./
COPY packages/contracts packages/contracts
COPY packages/web packages/web
# The Vite alias resolves @org/contracts from source during the build.
RUN npm run build --workspace=@org/web

# ---- Serve static assets with Caddy (also reverse-proxies the API) ----
FROM caddy:alpine AS runtime
COPY packages/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/packages/web/dist /usr/share/caddy
EXPOSE 80
