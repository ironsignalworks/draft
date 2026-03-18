import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const assetsDir = join(distDir, 'assets');
const enforceNoMaps = process.env.VERIFY_ENFORCE_NO_MAPS === 'true';
const enforceReleaseTraceability = process.env.CI === 'true' || process.env.VERIFY_ENFORCE_RELEASE === 'true';

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`OK: ${message}`);
  }
}

assert(existsSync(distDir), 'dist folder exists');
assert(existsSync(join(distDir, 'index.html')), 'dist/index.html exists');
assert(existsSync(join(distDir, '404.html')), 'dist/404.html exists for SPA fallback');
assert(existsSync(join(distDir, '_redirects')), 'dist/_redirects exists');

if (existsSync(assetsDir)) {
  const maps = readdirSync(assetsDir).filter((name) => name.endsWith('.map'));
  if (enforceNoMaps) {
    assert(maps.length === 0, 'source maps are not publicly shipped in dist/assets');
  } else {
    console.log(
      maps.length === 0
        ? 'OK: source maps are not publicly shipped in dist/assets'
        : 'INFO: source maps detected in dist/assets (expected in local builds; enforce with VERIFY_ENFORCE_NO_MAPS=true)',
    );
  }
} else {
  assert(false, 'dist/assets exists');
}

if (enforceReleaseTraceability) {
  assert(
    Boolean(process.env.VITE_SENTRY_RELEASE || process.env.VITE_APP_VERSION),
    'release traceability env exists (VITE_SENTRY_RELEASE or VITE_APP_VERSION)',
  );
} else {
  console.log(
    process.env.VITE_SENTRY_RELEASE || process.env.VITE_APP_VERSION
      ? 'OK: release traceability env exists'
      : 'INFO: release env not set locally; enforce in CI or with VERIFY_ENFORCE_RELEASE=true',
  );
}

if (process.exitCode && process.exitCode !== 0) {
  console.error('Post-deploy verification failed. See POST_DEPLOY_VERIFICATION.md for the manual checklist.');
} else {
  console.log('Post-deploy static verification passed. Continue with manual runtime checks.');
}
