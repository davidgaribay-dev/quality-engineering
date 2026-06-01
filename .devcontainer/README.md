# Dev Container — Playwright e2e

A committed [Dev Container](https://containers.dev) so everyone on the team runs the e2e suite
in the **same** image, with the same browsers, tooling, and VS Code extensions — and can watch
or record tests in a browser via **noVNC**.

The setup follows the official [Playwright Docker docs](https://playwright.dev/docs/docker) and
the [`desktop-lite`](https://github.com/devcontainers/features/tree/main/src/desktop-lite)
dev container feature.

## Prerequisites

- [Docker](https://www.docker.com/) running locally
- VS Code with the **Dev Containers** extension (`ms-vscode-remote.remote-containers`)

## Getting started

1. Open this repo in VS Code.
2. Command Palette → **Dev Containers: Reopen in Container**.
3. First build pulls `mcr.microsoft.com/playwright:v1.60.0-noble` and runs `npm ci`. Browsers
   are already baked into the image, so there's nothing else to install.

## Running tests (headless)

```bash
npx nx run e2e:e2e
```

Playwright flags forward **after** `--` so Nx doesn't intercept them:

```bash
npx nx run e2e:e2e -- --project=chromium
```

## Watching / recording tests in the browser (noVNC)

1. Open the **Ports** view in VS Code and open the forwarded port **6080** in your browser
   (or click the globe icon next to it).
2. Click **Connect** and enter the password `vscode`.
3. In the container terminal, run a **headed** session and watch it on the noVNC desktop:

   ```bash
   npx nx run e2e:e2e -- --headed --project=chromium
   ```

   Or generate tests interactively:

   ```bash
   npx playwright codegen
   ```

## Notes

- **Image version is pinned to the Playwright version** (`v1.60.0`). When you bump
  `@playwright/test` in `package.json`, bump the image tag in
  [`devcontainer.json`](./devcontainer.json) to match.
- **Extensions** are declared in both `devcontainer.json` (auto-installed in the container) and
  the repo's `.vscode/extensions.json` (local recommendations). Keep the two lists in sync.
- **Security:** the container runs as `root`, so only point it at your own apps under test —
  per the Playwright docs, don't use it to visit untrusted sites.
