# @org/web — Pet Adoption SPA

React + Vite + React Router v7 (data/SPA mode) + Tailwind v4 + shadcn-style UI.
Talks to the `@org/api` Hono backend; shares zod schemas/types via `@org/contracts`.

## Run locally

The web app calls the API same-origin through a Vite proxy (`/api` and `/images`
→ `http://localhost:3333`), so **start the API first**:

```bash
# terminal 1 — API on :3333
npm run start --workspace=@org/api

# terminal 2 — web on :4200
npm run serve --workspace=@org/web
```

Then open http://localhost:4200. (In the Linux devcontainer you can use the
inferred Nx targets instead: `nx serve api`, `nx serve web`.)

Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`
(all `--workspace=@org/web`).

## Flow

`/` landing → `/pets` list with a **dog/cat filter** (drives `?species=`, the
loader re-fetches) → `/pets/:id` detail → `/pets/:id/adopt` adoption /
request-more-info form (`?type=more-info` variant) → success confirmation.

## Test automation — `data-testid` conventions

Stable, framework-agnostic hooks so end-to-end specs don't depend on copy or
DOM structure. Prefer `getByTestId` over text/CSS selectors.

| Area | Test IDs |
| --- | --- |
| Nav / shell | `brand-home-link`, `main-nav` |
| Landing | `home-page`, `hero-browse`, `hero-dogs`, `hero-cats` |
| List | `pets-page`, `pets-count`, `pet-grid`, `pets-empty` |
| Species filter | `species-filter`, `species-filter-all`, `species-filter-dog`, `species-filter-cat` |
| Pet card | `pet-card` (+ `data-pet-id`, `data-species`), `pet-card-image`, `pet-card-species`, `pet-card-name` |
| Detail | `pet-detail` (+ `data-pet-id`), `back-to-pets`, `pet-detail-image`, `pet-detail-name`, `pet-detail-species`, `pet-detail-status`, `adopt-button`, `request-info-button` |
| Adoption form | `adopt-page`, `adopt-heading`, `inquiry-form`, `inquiry-fullName`, `inquiry-email`, `inquiry-phone`, `inquiry-household`, `inquiry-hasOtherPets`, `inquiry-message`, `inquiry-submit` |
| Validation errors | `inquiry-error-<field>` (e.g. `inquiry-error-email`), `inquiry-submit-error` |
| Success | `inquiry-success`, `inquiry-reference` |
| Errors | `route-error` |

**Convention:** kebab-case, scoped by feature. Lists expose a container id
(`pet-grid`) and repeated-item id (`pet-card`); disambiguate items via
`data-*` attributes (`data-pet-id`), not text. Add a matching `data-testid`
to any new interactive element.

> The extensions list in `.vscode/extensions.json` / `.devcontainer` and the
> standalone `packages/e2e` Playwright project can target these IDs directly.
