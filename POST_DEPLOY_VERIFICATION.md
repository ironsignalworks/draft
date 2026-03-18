# Post-Deploy Verification

Run this checklist after each production deployment.

## 1. Error Tracking

- Confirm release id in UI matches deployed SHA.
- Open browser console and run:
  - `window.__draftTestError?.()`
- Verify error appears in Sentry under current release.
- Verify stack trace is de-minified (sourcemaps working).

## 2. Security / Asset Validation

- Open production `dist/assets` listing (or source panel) and confirm `.map` files are not publicly served.
- Validate CSP is active and no blocked observability requests in network panel.

## 3. Routing

- Open a deep link directly (non-root route/query state).
- Refresh page and confirm app restores route correctly.

## 4. API Resilience

- Simulate API 500 / timeout (MSW mode or backend toggle).
- Confirm UI shows graceful fallback:
  - `Data temporarily unavailable`
  - `Try again later`
- Confirm retry/backoff does not spam backend.

## 5. Performance Signals

- Confirm telemetry events are emitted for:
  - `api_request` (with duration and slow flag)
  - `page_view`
  - `long_task` (when applicable)
  - `memory_pressure` (when applicable)

Deploy is complete only after all checks pass.
