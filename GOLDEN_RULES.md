# Golden Rules

These are non-negotiable engineering standards for Draft.

## 1) Schema first, UI later
- Define/validate domain contracts in Zod before rendering UI.
- References: `src/app/schemas/*`, `src/env.ts`

## 2) External data is never trusted
- All API responses must pass schema validation (`safeParse`).
- References: `src/app/services/api.ts`

## 3) Every deploy must be traceable
- Release id is Git SHA and exposed in build/runtime metadata.
- References: `vite.config.ts`, `.github/workflows/deploy-pages.yml`

## 4) Every crash must be logged
- React boundary + global error handlers + provider capture.
- References: `src/app/components/ErrorBoundary.tsx`, `src/app/lib/observability.ts`

## 5) If it isn't monitored, it isn't live
- Track page views, API metrics, long tasks, and memory pressure.
- References: `src/app/lib/observability.ts`, `src/app/App.tsx`

## 6) If it can't fail safely, it isn't ready
- Show graceful fallback states for failed/unavailable data.
- References: `src/app/components/ErrorBoundary.tsx`, hooks/service error handling

## 7) Config must be validated at runtime
- Boot must fail fast on invalid config.
- References: `src/env.ts`, `scripts/check-env-contract.mjs`

## 8) Every feature must be disable-able
- Use flags via validated env/remote policy before rollout.
- References: `src/app/lib/flags.ts`, `.env.example`

## 9) Every build must be versioned
- Build injects version and release constants.
- References: `vite.config.ts`, `src/vite-env.d.ts`

## 10) Every deploy must be reversible
- Rollback workflow and artifact retention required.
- References: `.github/workflows/rollback-pages.yml`, `deploy-pages.yml`

## 11) Performance regressions are bugs
- Bundle budget and runtime performance telemetry are mandatory.
- References: `scripts/check-bundle-budget.mjs`, CI workflow, observability events

## 12) If users can't be observed, product can't improve
- Session replay/telemetry providers and event tracking must be active in production.
- References: `src/app/lib/observability.ts`

## 13) If startup fails silently, the app is broken
- Startup must fail loudly on invalid env and capture startup exceptions.
- References: `src/main.tsx`, `src/env.ts`, global handlers in observability

## 14) If debugging needs guessing, observability is missing
- Errors, API timings, release metadata, and deploy verification checklist are required.
- References: `POST_DEPLOY_VERIFICATION.md`, observability module, CI release wiring
