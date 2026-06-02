# Dev Container — Playwright e2e

A committed [Dev Container](https://containers.dev) so everyone on the team runs the e2e suite
in the **same** image, with the same browsers, tooling, and VS Code extensions — and can watch
or record tests in a browser via **noVNC**.

The setup follows the official [Playwright Docker docs](https://playwright.dev/docs/docker), the
[`desktop-lite`](https://github.com/devcontainers/features/tree/main/src/desktop-lite) and
[`docker-in-docker`](https://github.com/devcontainers/features/tree/main/src/docker-in-docker)
dev container features.

## Prerequisites

- [Docker](https://www.docker.com/) running locally
- VS Code with the **Dev Containers** extension (`ms-vscode-remote.remote-containers`)

## Getting started

1. Open this repo in VS Code.
2. Command Palette → **Dev Containers: Reopen in Container**.
3. First build pulls `mcr.microsoft.com/playwright:v1.60.0-noble` and runs `npm ci`. Browsers
   are already baked into the image, so there's nothing else to install.

## Running tests (headless)

The suite's `webServer` config boots the API (:3333) and web (:4200) automatically, so from a
clean checkout you can just run (from `packages/e2e`):

```bash
npm run e2e            # full suite (api + ui-chromium projects)
npm run e2e:smoke      # @smoke subset (fast gate)
npm run e2e:api        # API project only
npm run e2e:ui         # UI project only
npm run e2e:report     # open the HTML report
```

Inside the Linux devcontainer the inferred Nx target works too (flags forward after `--`):

```bash
npx nx run e2e:e2e -- --project=ui-chromium
```

## Watching / recording tests in the browser (noVNC)

1. Open the **Ports** view in VS Code and open the forwarded port **6080** in your browser
   (or click the globe icon next to it).
2. Click **Connect** and enter the password `vscode`.
3. In the container terminal, run a **headed** session and watch it on the noVNC desktop:

   ```bash
   npm run e2e:headed
   ```

   Or generate tests interactively:

   ```bash
   npx playwright codegen
   ```

## Running the app in Docker (docker-in-docker)

The `docker-in-docker` feature gives the container its own Docker daemon, so you can build and
run the app images right here:

```bash
docker compose up --build      # api + web (Caddy), open http://localhost:4200
```

Ports **4200** and **3333** are forwarded, so the dockerized stack is reachable from your host
browser. Images/containers live **inside** the devcontainer, isolated from the host daemon.

## Notes

- **Image version is pinned to the Playwright version** (`v1.60.0`). When you bump
  `@playwright/test` in `package.json`, bump the image tag in
  [`devcontainer.json`](./devcontainer.json) to match.
- **Extensions** are declared in both `devcontainer.json` (auto-installed in the container) and
  the repo's `.vscode/extensions.json` (local recommendations). Keep the two lists in sync.
- **Security:** the container runs as `root`, so only point it at your own apps under test —
  per the Playwright docs, don't use it to visit untrusted sites.
