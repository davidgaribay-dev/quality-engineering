# syntax=docker/dockerfile:1
# Build from the REPO ROOT so the @org/contracts sibling is in context:
#   docker build -f packages/api/Dockerfile -t qe-api .
ARG NODE_VERSION=lts-alpine

# ---- Dependencies (workspace-aware) ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# Manifests first for layer caching. tsx (a devDep) is needed at runtime, so we
# install the full dependency set (no --omit=dev).
COPY package*.json ./
COPY packages/api/package.json       packages/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/web/package.json       packages/web/package.json
COPY packages/e2e/package.json       packages/e2e/package.json
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- Runtime ----
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production
# The API runs via tsx and resolves @org/contracts from source, exactly as it
# does locally — so we ship the source for api + contracts plus the base tsconfig.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json tsconfig.base.json ./
COPY --chown=node:node packages/contracts packages/contracts
COPY --chown=node:node packages/api packages/api
USER node
EXPOSE 3333
CMD ["npm", "run", "start", "--workspace=@org/api"]
