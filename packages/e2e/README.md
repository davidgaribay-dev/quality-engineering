# @org/e2e — Playwright SDET framework

End-to-end **and** API test framework for the pet-adoption stack, built on
[Playwright](https://playwright.dev). It exercises the Hono API (`@org/api`, :3333) and the
React SPA (`@org/web`, :4200), and reuses the shared `@org/contracts` zod schemas to enforce
the API contract from the test layer.

## Architecture

```
src/
  support/
    env.ts          # defaulted config (BASE_URL / API_URL / LOG_LEVEL)
    logger.ts       # Winston: colorized console + JSON file (logs/test-run.log)
    api-client.ts   # typed APIRequestContext wrapper; zod-validates every response
    fixtures.ts     # test.extend → { log, api, home, pets, petDetail, adopt }
  pages/            # Page Object Models (locators via getByTestId only)
    base.page.ts  home.page.ts  pets.page.ts  pet-detail.page.ts  adopt.page.ts
  data/
    factories.ts                  # faker synthetic inquiry data (schema-validated)
    pets.dataset.ts               # known catalog expectations (7 pets: 4 dogs, 3 cats)
    inquiry-validation.dataset.ts # data-driven UI + API validation cases
  setup/
    global.setup.ts # setup project: health-gates the API + SPA, logs the env
  tests/
    api/  health · pets · inquiries
    ui/   smoke · browse-and-filter · adoption-flow · inquiry-validation
```

**Patterns used** (all from the official docs):

- **Page Object Model** + **custom fixtures** — POMs are injected via `test.extend`, so specs
  read as intent (`await petDetail.startAdoption()`), never raw selectors.
- **Web-first assertions** (`await expect(locator).toBeVisible()`) and `getByTestId` against the
  app's stable `data-testid` hooks — no CSS/text coupling.
- **API testing** with `APIRequestContext`; every response is parsed with the `@org/contracts`
  schema (`PetListSchema`, `InquiryResponseSchema`, …).
- **Data-driven** tests loop over datasets (species filters, invalid-field cases). **Synthetic
  data** comes from `@faker-js/faker` factories — a fresh applicant every run.
- **Winston logging** with a per-test child logger (auto fixture) stamping the test name onto
  every line; JSON file at `logs/test-run.log`, level via `LOG_LEVEL`.
- **Tags**: `@smoke` (fast critical path), `@regression` (full), `@api` / `@ui`.
- **Projects**: a `setup` health-gate → `api` (no browser) and `ui-chromium`, both depending on
  `setup`. `webServer` boots the API + web before the run.

## Running

`webServer` starts both servers automatically — no manual setup needed:

```bash
npm run e2e            # everything (api + ui-chromium)
npm run e2e:smoke      # --grep @smoke
npm run e2e:regression # --grep @regression
npm run e2e:api        # --project=api
npm run e2e:ui         # --project=ui-chromium
npm run e2e:headed     # UI, headed
npm run e2e:report     # open the HTML report
```

Filter by tag directly, too: `npx playwright test --grep "@smoke|@regression"`.

### Config

Copy `.env.example` → `.env` to override `BASE_URL` / `API_URL` / `LOG_LEVEL`; all have safe
local defaults, so the suite runs without one. Against the dockerized stack
(`docker compose up`), the defaults already point at :4200 / :3333.

## CI

`.github/workflows/e2e.yml` runs `@smoke` on PRs and the full `@regression` suite (sharded 4×,
blob reports merged into one HTML report) on pushes to `main`. Chromium only.

## Adding tests

1. Add a `data-testid` to any new interactive element in `@org/web` (see that package's README).
2. Expose it as a locator on the relevant POM in `src/pages/`.
3. Write the spec under `src/tests/{api,ui}` and tag it (`{ tag: ['@smoke'] }` / `['@regression']`).
4. Need varied input? Add/extend a factory in `src/data/factories.ts`.
