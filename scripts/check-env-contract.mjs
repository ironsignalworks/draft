import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const expectedKeys = [
  'VITE_SENTRY_DSN',
  'VITE_SENTRY_ENV',
  'VITE_SENTRY_RELEASE',
  'VITE_LOGROCKET_ID',
  'LOGROCKET_ID',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  'VITE_API_URL',
  'VITE_APP_VERSION',
  'VITE_ENABLE_MSW',
  'VITE_FEATURE_NEW_UI',
];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const envExamplePath = resolve(scriptDir, '..', '.env.example');

if (!existsSync(envExamplePath)) {
  console.error(`Missing required env contract file: ${envExamplePath}`);
  process.exit(1);
}

const raw = readFileSync(envExamplePath, 'utf8');
const keys = raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'))
  .map((line) => line.split('=')[0]?.trim())
  .filter(Boolean);

const missing = expectedKeys.filter((key) => !keys.includes(key));
const unexpected = keys.filter((key) => !expectedKeys.includes(key));

if (missing.length > 0 || unexpected.length > 0) {
  if (missing.length > 0) {
    console.error(`Missing env keys: ${missing.join(', ')}`);
  }
  if (unexpected.length > 0) {
    console.error(`Unexpected env keys: ${unexpected.join(', ')}`);
  }
  process.exit(1);
}

console.log('Env contract check passed.');
