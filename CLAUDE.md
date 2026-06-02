<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

---

# quality-engineering — project guide

A **pet-adoption** full-stack app that exists as a realistic test bed for an **SDET / quality-engineering** showcase. The interesting work lives in `packages/e2e` (the Playwright framework); the app is the system-under-test. When in doubt, optimize for **testability and clear test architecture**, not product features.

## The stack at a glance

| Package | Name | What it is | Port | Run |
|---|---|---|---|---|
| `packages/contracts` | `@org/contracts` | Shared **zod** schemas + inferred types. The single source of truth for the API contract — used by the API (validates requests/responses), the web form (react-hook-form resolver), and the tests (response validation). | — | library |
| `packages/api` | `@org/api` | **Hono** REST API on `@hono/node-server`, run directly via **tsx** (no build step). In-memory pet catalog. Serves `/api/*` and bundled `/images/*`. | 3333 | `npm run start --workspace=@org/api` |
| `packages/web` | `@org/web` | **React 19 + Vite 6** SPA. React Router 7 (loader pattern), react-hook-form + zod, Tailwind v4, shadcn-style UI. Dev Vite proxies `/api` + `/images` → :3333. | 4200 | `npm run serve --workspace=@org/web` |
| `packages/e2e` | `@org/e2e` | **Playwright** SDET framework: POM + fixtures + Winston + faker + data-driven API & UI tests. `"type": "module"`. | — | `cd packages/e2e && npm run e2e` |

The contract flows one way: **contracts → (api, web, e2e)**. Never duplicate a type that exists in `@org/contracts`; import it.

## Workspace model & tooling

- **Nx 22.7.5, package-based** (not integrated). Each package self-registers via `"nx": { "name": "..." }` in its `package.json`. Targets (`build`, `typecheck`, `e2e`) are **inferred** by the `@nx/js/typescript` and `@nx/playwright` plugins — see `nx.json`.
- **TS solution setup**: `tsconfig.base.json` is `composite`, `module/moduleResolution: nodenext`, `strict`, `noUnusedLocals`, `emitDeclarationOnly`. Root `tsconfig.json` references only `contracts` + `e2e` (api/web are runtime-only, not in the TS build graph).
- **Source-level resolution**: `tsconfig.base.json` sets `customConditions: ["@org/source"]` and `@org/contracts` exposes an `"@org/source": "./src/index.ts"` export condition. This is why api (tsx) and web (Vite) resolve `@org/contracts` straight from `.ts` source with **no build step** for contracts. Don't add one.
- **npm workspaces**, glob `packages/*`. Root package is `@org/source`.

### ⚠️ Running commands — read this

The **Nx CLI is broken on the macOS host** (`@nx/nx-darwin-arm64` is not installed; only the Linux natives are present, because `npm ci` runs in the Linux devcontainer/CI). On the Mac host, `npx nx ...` will crash. Two consequences:

1. **Prefer tooling-agnostic `npm run … --workspace=@org/…` commands** over `nx run …`. They work identically on the Mac host, in the devcontainer, and in CI. The Nx-block guidance above ("always prefer nx") is aspirational and does **not** hold on this Mac host.
2. **Do dependency installs in the devcontainer**, or restore the darwin binary afterward with `npm install @nx/nx-darwin-arm64@22.7.5 --no-save`. Any `npm install` on the host re-prunes it.

The e2e Playwright config was deliberately written **without** `nxE2EPreset` so it doesn't load Nx at all (it also fixed an ESM `__filename is not defined` crash, since the package is `"type": "module"`). Nx still infers the `e2e` target from the config file's presence.

## Common commands

```bash
# Run the app locally (two terminals, or rely on Playwright's webServer)
npm run start --workspace=@org/api      # API on :3333  (tsx, no build)
npm run serve --workspace=@org/web      # SPA on :4200  (Vite dev + proxy)

# Tests — ALWAYS run from packages/e2e (see gotcha below)
cd packages/e2e
npm run e2e            # full suite (setup → api → ui-chromium); webServer auto-boots api+web
npm run e2e:smoke      # playwright test --grep @smoke
npm run e2e:regression # playwright test --grep @regression
npm run e2e:api        # --project=api      (no browser)
npm run e2e:ui         # --project=ui-chromium
npm run e2e:headed     # ui-chromium, headed (use the devcontainer noVNC desktop on :6080)
npm run e2e:report     # open the HTML report

# Typecheck a package
npm run typecheck --workspace=@org/api   # also: @org/web, @org/contracts

# Dockerized stack
docker compose up --build                # SPA at http://localhost:4200 (Caddy proxies /api,/images → api)
```

### ⚠️ Always run Playwright from `packages/e2e`

Playwright discovers its config by cwd. Run `npx playwright test` from the repo root or `packages/` and there is **no config**, so it falls back to a default anonymous project (`"project": ""`) with no `baseURL` and no `projects` — UI tests then fail with `Cannot navigate to invalid URL`. Run from `packages/e2e` (or use the `npm run e2e*` scripts, which set cwd).

---

# The system under test (facts the tests rely on)

## API surface (`@org/api`)

CORS is open (`app.use('*', cors())`). All bodies validated with zod `safeParse`.

| Method | Path | Success | Notes |
|---|---|---|---|
| GET | `/health` | 200 `{ status: "ok" }` | setup health-gate |
| GET | `/api/pets` | 200 `Pet[]` | optional `?species=dog\|cat` (validated by `PetQuerySchema`); invalid → 400 `{ error: "Invalid species filter" }` |
| GET | `/api/pets/:id` | 200 `Pet` | unknown id → 404 `{ error: "Pet not found" }` |
| POST | `/api/pets/:id/inquiries` | 201 `InquiryResponse` | unknown pet → 404; invalid body → 400 `{ error: "Validation failed", issues }`. **Mock**: acknowledges only, no persistence/email. |
| GET | `/images/:file` | 200 image | path-traversal guarded; bad type → 400; missing → 404; `Cache-Control: public, max-age=86400` |

Data is an **in-memory hardcoded array** in `packages/api/src/data/pets.ts` (validated at load with `PetListSchema.parse`). It resets on restart; **no DB, no auth, no storage state** — tests are stateless and the setup project only health-gates.

## The catalog (asserted by tests — keep in sync)

**7 pets: 4 dogs, 3 cats.** Statuses are all `available` except **`coco` (dog) is `pending`**.

- Dogs: `biscuit`, `ziggy`, `coco` (pending), `peanut`
- Cats: `mango`, `willow`, `pumpkin`

The e2e dataset `packages/e2e/src/data/pets.dataset.ts` encodes this as `CATALOG = { total: 7, bySpecies: { dog: 4, cat: 3 } }` and `SAMPLE_PETS = { available: 'biscuit', pending: 'coco', missing: 'does-not-exist' }`. **If you change the seed data, update this dataset** (and vice versa).

## Contracts (`@org/contracts`)

Exports from `src/index.ts` (`pet.ts` + `inquiry.ts`):

- Enums: `Species` (`dog|cat`), `Gender` (`male|female`), `Size` (`small|medium|large`), `PetStatus` (`available|pending|adopted`), `RequestType` (`adopt|more-info`), `HouseholdType` (`house|apartment|other`).
- `PetSchema` / `Pet`, `PetListSchema`, `PetQuerySchema`.
- `InquirySchema` / `Inquiry` — the key one. Validates the web form (via `zodResolver`) **and** the API body, so they cannot drift:
  - `fullName` min 2; `email` valid email; `phone` optional/empty or `/^[0-9+()\-\s]{7,}$/`; `householdType` enum; `hasOtherPets` boolean; `message` optional max 1000; `requestType` enum.
- `InquiryResponseSchema` — `{ id, petId, petName, requestType, status: 'received', submittedAt }`.

The phone regex is why the faker factory builds `+1 (NNN) NNN-NNNN` — see `syntheticPhone()`.

## data-testid contract (web ↔ e2e)

The SPA exposes stable `data-testid` hooks; **tests locate by testid only** (`getByTestId`), never CSS/text. When adding UI, add a testid and surface it on the relevant POM. Current inventory:

- Layout: `brand-home-link`, `main-nav`
- Home: `home-page`, `hero-browse`, `hero-dogs`, `hero-cats`
- Pets list: `pets-page`, `pets-count`, `species-filter`, `species-filter-{all,dog,cat}`, `pets-empty`, `pet-grid`
- Pet card: `pet-card` (+ `data-pet-id`, `data-species` attrs), `pet-card-image`, `pet-card-species`, `pet-card-name`
- Pet detail: `pet-detail` (+ `data-pet-id`), `back-to-pets`, `pet-detail-image`, `pet-detail-status`, `pet-detail-species`, `pet-detail-name`, `adopt-button` (disabled unless available), `request-info-button`
- Adopt page: `adopt-page`, `back-to-pet`, `adopt-heading`, `inquiry-form`
- Inquiry fields: `inquiry-{fullName,email,phone,household,hasOtherPets,message}`, `inquiry-submit`
- Inquiry errors: `inquiry-error-{fullName,email,phone,message}`, `inquiry-submit-error`
- Inquiry success: `inquiry-success`, `inquiry-reference`
- Error boundary: `route-error`

SPA routes: `/` (home), `/pets?species=`, `/pets/:id` (detail), `/pets/:id/adopt?type=adopt|more-info`.

---

# Testing strategy & conventions (`@org/e2e`)

This is the heart of the repo. Follow the existing architecture exactly when adding tests.

## Layout

```
src/
  support/   env.ts · logger.ts · api-client.ts · fixtures.ts   # framework infra
  pages/     base.page.ts + home/pets/pet-detail/adopt POMs       # locators via getByTestId only
  data/      factories.ts (faker) · pets.dataset.ts · inquiry-validation.dataset.ts
  setup/     global.setup.ts                                      # health-gate, the `setup` project
  tests/api/ health · pets · inquiries
  tests/ui/  smoke · browse-and-filter · adoption-flow · inquiry-validation
```

## Projects (playwright.config.ts)

`setup` (health-gate) → **`api`** (`tests/api/**`, baseURL=apiURL, no browser) and **`ui-chromium`** (`tests/ui/**`, Desktop Chrome, baseURL=baseURL). Both `dependencies: ['setup']`. **Chromium only** (Firefox/WebKit intentionally out of scope; trivial to add). `webServer[]` boots api+web with `cwd: '../..'` and `reuseExistingServer: !CI`. `testIdAttribute: 'data-testid'`. Reporters: CI → blob+junit+github+allure; local → list+html+allure.

## Conventions — do these

- **Fixtures over boilerplate** (`src/support/fixtures.ts`). Inject by name: `test('…', async ({ log, api, home, pets, petDetail, adopt }) => …)`.
  - `log` — **auto fixture**, per-test Winston child logger (`logger.child({ test: title })`); logs ▶ start / ■ finish+status. Use `log.info(...)` for notable events.
  - `api` — `ApiClient` over a fresh `APIRequestContext` at `apiURL`, disposed per test.
  - `home/pets/petDetail/adopt` — POM instances bound to `page` + `log`.
  - Import `test` and `expect` from `fixtures.ts`, **not** from `@playwright/test` directly.
- **POMs** extend `BasePage`; expose `readonly` locators via `this.byTestId('…')` and actions as async methods. Keep navigation/actions in the POM, **assertions in the spec**. No CSS/XPath/text selectors.
- **Web-first assertions** only: `await expect(locator).toBeVisible()`, `await expect(response).toBeOK()`. No manual waits/sleeps.
- **API tests validate with zod**: `ApiClient` parses every happy-path response through the `@org/contracts` schema (`listPets`→`PetListSchema`, `getPet`→`PetSchema`, `createInquiry`→`InquiryResponseSchema`). For negative paths use the raw `*Response()` variants (`getPetResponse`, `postInquiryResponse`) and assert status + error shape.
- **Synthetic data via factories** (`src/data/factories.ts`): `makeInquiry(overrides)`, `makeInfoRequest()`, `makeInquiryFormInput()`. All faker-backed and **schema-validated before return** (fail-fast on drift). Fresh data each run. Don't hardcode applicant data in specs.
- **Data-driven**: loop over datasets to generate tests. `SPECIES_CASES` drives both API and UI filter tests; `FIELD_VALIDATION_CASES` (UI inline errors) and `API_VALIDATION_CASES` (400 rejections) drive validation tests. Add a row to the dataset rather than copy-pasting a test.
- **Tag every test**: `{ tag: ['@smoke'] }` / `['@regression']` / `['@api']`. `@smoke` = fast critical path (PR gate); `@regression` = full coverage (main); `@api` = HTTP-only. A test can carry multiple.

## Adding a test (recipe)

1. Need a new UI hook? Add a `data-testid` in `@org/web`, then a `readonly` locator on the relevant POM in `src/pages/`.
2. Need data? Add/extend a factory in `src/data/factories.ts` (keep it schema-valid) or a row in a dataset.
3. Write the spec under `tests/api/**` or `tests/ui/**`, inject fixtures, assert web-first, and **tag it**.
4. Run `npm run e2e:smoke` (fast) then the relevant `:api`/`:ui` project from `packages/e2e`.

---

# Infra

## Docker

- `packages/api/Dockerfile` — multi-stage `node:lts-alpine`; runtime ships `node_modules` + `tsconfig.base.json` + `packages/contracts` + `packages/api` and runs `tsx` as non-root `node`. Dev deps kept (tsx is needed at runtime). Build context = **repo root**.
- `packages/web/Dockerfile` — Vite build stage → **Caddy** (`caddy:alpine`) runtime serving static `dist/` and **reverse-proxying `/api/*` and `/images/*` to `api:3333`** (`packages/web/Caddyfile`), with SPA fallback to `/index.html`.
- `docker-compose.yml` — `api` (3333, wget healthcheck on `/health`) + `web` (4200:80, `depends_on api: service_healthy`).
- **Devcontainer DinD gotcha**: inside the docker-in-docker devcontainer, `docker compose up --build` can fail with `error getting credentials` (the VS Code Dev Containers extension injects a credential helper that doesn't exist in the nested daemon). Fix: `echo '{}' > ~/.docker/config.json` then rebuild. Running the Docker stack is **not** required for the Playwright suite — `webServer` boots api/web itself.

## Devcontainer

`.devcontainer/devcontainer.json` — base image `mcr.microsoft.com/playwright:v1.60.0-noble` (browsers prebaked), features `desktop-lite` (noVNC :6080, password `vscode`) + `docker-in-docker:2`; `runArgs: ["--ipc=host","--init"]` (Chromium stability); `forwardPorts: [6080, 4200, 3333]`; post-create `npm ci`. Use the noVNC desktop on :6080 to watch headed runs.

## CI — `.github/workflows/e2e.yml`

- **`@smoke` on pull_request → main** (fast gate, chromium).
- **`@regression` on push → main**, sharded 4× (`--shard=i/4`), each uploads a blob report.
- **`merge-reports`** downloads the blob shards and merges into one HTML report.
- **`allure-report`** regenerates the Allure 3 report from all shards, restores/extends `history.jsonl` from the `gh-pages` branch (unbounded run history), and publishes to **GitHub Pages** (https://davidgaribay-dev.github.io/quality-engineering). Allure config: `packages/e2e/allurerc.mjs`; results come from the `allure-playwright` reporter (`allure-results/`, gitignored). Local: `npm run allure:generate && npm run allure:open --workspace=@org/e2e`.
- Playwright's `webServer` starts api+web in CI (`reuseExistingServer: false`) — there is no separate "start servers" step. `defaults.run.working-directory: packages/e2e`; `npm ci` runs at repo root.

---

# Conventions & preferences

- **Prettier**: single quotes (`.prettierrc`). Match surrounding style; keep comments purposeful and sparse.
- **Reuse the contract**: any pet/inquiry shape comes from `@org/contracts`. Don't redefine types or validation.
- **Stateless app**: no DB/auth/storageState — don't add test setup/teardown for data; the catalog is fixed and inquiries are mock-acknowledged.
- **Keep app and tests in sync**: changes to seed data, routes, testids, or the inquiry contract must be reflected in `packages/e2e` datasets/POMs, and vice versa.
- **Verify before claiming done**: run the relevant e2e subset from `packages/e2e` and report real output. Baseline: full suite is **30 tests** (1 setup + 16 api + 13 ui-chromium).
