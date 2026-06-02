# quality-engineering

A full-stack **pet-adoption** app that serves as a realistic test bed for an **SDET / quality-engineering** showcase. The product (a Hono API + React SPA, sharing one set of zod contracts) is the system under test; the centerpiece is the **Playwright framework** in [`packages/e2e`](packages/e2e) — Page Object Model, fixtures, synthetic data, data-driven API **and** UI tests, structured logging, and a CI pipeline that publishes a historical **Allure** report to GitHub Pages.

**📊 Live Allure test report:** https://davidgaribay-dev.github.io/quality-engineering

> Nx 22.7.5 package-based monorepo · npm workspaces · TypeScript solution (composite, `nodenext`) · contracts resolved from source via the `@org/source` export condition.

## Packages

| Package | Name | Stack | Port |
|---|---|---|---|
| [`packages/contracts`](packages/contracts) | `@org/contracts` | Shared **zod** schemas + inferred types. One source of truth for the API contract, consumed by the API, the web form, and the tests. | — |
| [`packages/api`](packages/api) | `@org/api` | **Hono** REST API on `@hono/node-server`, run directly with **tsx** (no build step). In-memory pet catalog; serves `/api/*` and bundled `/images/*`. | 3333 |
| [`packages/web`](packages/web) | `@org/web` | **React 19 + Vite 6** SPA. React Router 7 (loader pattern), react-hook-form + zod, Tailwind v4, shadcn-style UI. | 4200 |
| [`packages/e2e`](packages/e2e) | `@org/e2e` | **Playwright** SDET framework: POM, fixtures, Winston, faker, data-driven specs, Allure reporting. | — |

The contract flows one way — **contracts → (api, web, e2e)** — so the API body, the web form, and the test assertions can never drift apart.

## The app

A small adoption site for **7 pets (4 dogs, 3 cats)**; all `available` except `coco`, which is `pending`.

- `GET /health` → `{ status: "ok" }`
- `GET /api/pets` (optional `?species=dog|cat`) → `Pet[]`
- `GET /api/pets/:id` → `Pet` (404 if unknown)
- `POST /api/pets/:id/inquiries` → `201 InquiryResponse` (mock — acknowledges only; 400 on invalid body, 404 on unknown pet)
- `GET /images/:file` → bundled pet photo (path-traversal guarded, 24h cache)

The SPA routes: `/` · `/pets?species=` · `/pets/:id` · `/pets/:id/adopt?type=adopt|more-info`. Every interactive element carries a stable `data-testid` so tests bind to hooks, not markup.

## Quick start

Requires Node LTS. Install once with `npm ci`.

```bash
# Run the app (two terminals) — or just run the tests; Playwright boots both itself.
npm run start --workspace=@org/api     # API  → http://localhost:3333
npm run serve --workspace=@org/web     # SPA  → http://localhost:4200
```

### Tests

Playwright's `webServer` starts the API + SPA automatically, so the suite runs from a clean checkout with nothing else running. **Run from `packages/e2e`** (the config is discovered by cwd):

```bash
cd packages/e2e
npm run e2e             # full suite: setup → api → ui-chromium
npm run e2e:smoke       # @smoke   — fast critical path (PR gate)
npm run e2e:regression  # @regression — full coverage
npm run e2e:api         # --project=api  (no browser)
npm run e2e:ui          # --project=ui-chromium
npm run e2e:headed      # headed (use the devcontainer noVNC desktop on :6080)
npm run e2e:report      # open the Playwright HTML report
```

Baseline: **30 tests** (1 setup + 16 api + 13 ui-chromium).

## The Playwright framework

```
packages/e2e/src/
  support/   env · logger (Winston) · api-client (zod-validated) · fixtures
  pages/     BasePage + home / pets / pet-detail / adopt   (locators via getByTestId only)
  data/      factories (faker) · pets.dataset · inquiry-validation.dataset
  setup/     global.setup.ts — health-gates the stack
  tests/api/ health · pets · inquiries
  tests/ui/  smoke · browse-and-filter · adoption-flow · inquiry-validation
```

- **Projects**: a `setup` health-gate → `api` (no browser, hits :3333) and `ui-chromium` (Chromium SPA), both depending on `setup`.
- **Fixtures** (`test.extend`): an auto per-test Winston child logger (`log`), a zod-validating `ApiClient` (`api`), and the four POMs (`home`, `pets`, `petDetail`, `adopt`).
- **POM, testid-only**: locators come from `data-testid` via `getByTestId` — never CSS/text. Actions live on the page object; assertions live in the spec; assertions are web-first.
- **Synthetic data**: faker factories (`makeInquiry`, `makeInfoRequest`, `makeInquiryFormInput`) produce fresh, **schema-validated** applicants each run.
- **Data-driven**: datasets drive species-filter, UI field-validation, and API rejection cases — add a row, not a test.
- **Contract validation**: API responses are parsed through the `@org/contracts` schemas, so a contract break fails a test.
- **Tags**: `@smoke` / `@regression` / `@api`.

## Reporting

- **Local**: list reporter + browsable Playwright HTML (`npm run e2e:report`).
- **CI**: blob (mergeable across shards), JUnit, GitHub annotations, **and Allure** results.
- **Allure 3** (`allurerc.mjs`) builds the *Quality Engineering* report with failure categories and **unbounded run history** (a single `history.jsonl` carried on the `gh-pages` branch). CI generates it from all shards and publishes it to **GitHub Pages**:

  **📊 Live report → https://davidgaribay-dev.github.io/quality-engineering**

```bash
npm run allure:generate --workspace=@org/e2e   # ./allure-results → ./allure-report
npm run allure:open --workspace=@org/e2e
```

## Docker

```bash
docker compose up --build      # SPA at http://localhost:4200
```

- `packages/api/Dockerfile` — multi-stage `node:lts-alpine`; runs `tsx` as non-root `node`, resolving `@org/contracts` from source.
- `packages/web/Dockerfile` — Vite build → **Caddy** serving static `dist/` and reverse-proxying `/api/*` + `/images/*` to the `api` service (`packages/web/Caddyfile`).
- `docker-compose.yml` — `api` (healthchecked on `/health`) + `web`, which waits for the API to be healthy.

## Dev container

`.devcontainer/` provides a reproducible environment on `mcr.microsoft.com/playwright` with browsers prebaked, **docker-in-docker** (to build/run the compose stack inside), and a **noVNC desktop on :6080** for watching headed runs. Forwarded ports: `6080`, `4200`, `3333`. After rebuild, `npm ci` runs automatically.

> If `docker compose up --build` fails inside the container with `error getting credentials`, clear the injected helper once: `echo '{}' > ~/.docker/config.json`, then rebuild. (The Playwright suite doesn't need Docker — `webServer` boots the app itself.)

## CI

[`.github/workflows/e2e.yml`](.github/workflows/e2e.yml):

- **Pull request → `main`**: `@smoke` job — fast gate, Chromium.
- **Push → `main`**: `@regression` sharded 4×; each shard uploads blob + Allure results.
- **`merge-reports`**: merges blob shards into one Playwright HTML report.
- **`allure-report`**: regenerates the Allure report from all shards, restores/extends `history.jsonl`, and publishes to GitHub Pages → [davidgaribay-dev.github.io/quality-engineering](https://davidgaribay-dev.github.io/quality-engineering).

Playwright's `webServer` starts the API + frontend in CI — there is no separate "start servers" step.

## Workspace notes

- **Package-based Nx**: each package self-registers via `"nx": { "name": "..." }`; `build`/`typecheck`/`e2e` targets are inferred by the `@nx/js/typescript` and `@nx/playwright` plugins.
- **Prefer `npm run … --workspace=@org/…`** over the Nx CLI on a macOS host — the `@nx/nx-darwin-arm64` native binary isn't installed (deps are installed in the Linux devcontainer/CI), so `npx nx …` crashes there. Do installs in the devcontainer, or restore it with `npm install @nx/nx-darwin-arm64@22.7.5 --no-save`.
- **Always run Playwright from `packages/e2e`** — run it from a parent directory and there's no config, so it falls back to an anonymous project with no `baseURL` and UI tests fail with "invalid URL."

See [CLAUDE.md](CLAUDE.md) for the full contributor guide (conventions, the data-testid inventory, the contract schemas, and the recipe for adding a test).
