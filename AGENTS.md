# Repository Guidelines

Use this guide to align contributions with the Halliday + Story Protocol example app.

## Project Structure & Module Organization
The Next.js App Router code lives under `app/`. `app/page.tsx` drives the Halliday payment flow, shared providers sit in `app/Web3Providers.tsx`, and helper logic is in `app/utils/viem-signer-adapter.ts`. Styling is global via `app/globals.css`, while static assets belong in `public/`. Core configuration files include `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, and `eslint.config.mjs`. Reference `INTEGRATION_GUIDE.md` and `SETUP_STORY_NETWORK.md` for workflow-specific steps.

## Build, Test, and Development Commands
- `npm run dev` – start the app with Turbopack for rapid local iteration.
- `npm run build` – produce an optimized production bundle.
- `npm start` – serve the latest build; use for smoke-testing prod output.
- `npm run lint` – run ESLint with the Next.js config to catch type, accessibility, and import issues.

Reinstall dependencies with `npm install` after pulling, and run `npm run lint` before opening a PR.

## Coding Style & Naming Conventions
Write TypeScript-first React components with 2-space indentation as in existing files. Use PascalCase for components (`TestComponent.tsx`), camelCase for hooks and helpers, and UPPER_SNAKE_CASE for environment variables. Keep side-effectful hooks guarded by dependency checks, and reserve `console` logging for troubleshooting. Tailwind CSS v4 utilities live directly in JSX; global overrides belong in `app/globals.css`. The ESLint configuration is the source of truth—fix, don’t suppress, lint findings.

## Testing Guidelines
Automated tests are not bundled yet, so prioritize fast manual verification: connect a Story-enabled wallet, exercise the Halliday purchase path, and inspect console output for network-switch logs. When adding automated coverage, colocate specs in `app/__tests__/` (or alongside components) and expose a runner via `package.json` (e.g., Vitest or Playwright). Update this guide with any new test commands or coverage expectations.

## Commit & Pull Request Guidelines
The history favors concise, imperative commit subjects (`add .env.example`). Keep commits scoped to a single concern and include relevant context in the body when needed. Pull requests should describe intent, list manual test steps, and link issues or supporting docs. Include screenshots or console snippets when they clarify wallet or payment behavior.

## Environment & Web3 Configuration
Copy `.env.example` to `.env` and supply `NEXT_PUBLIC_HALLIDAY_PUBLIC_API_KEY`. Coordinate Story network access using `SETUP_STORY_NETWORK.md`, and adjust `app/Web3Providers.tsx` if chain IDs or transports change. Never commit real API keys; only expose safe browser values with the `NEXT_PUBLIC_` prefix.
