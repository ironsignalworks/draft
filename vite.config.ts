import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const releaseId = process.env.VITE_SENTRY_RELEASE ?? process.env.GITHUB_SHA ?? 'local-dev';
const appVersion = process.env.VITE_APP_VERSION ?? process.env.npm_package_version ?? '0.0.0';
const shouldUploadSourcemaps =
  process.env.SENTRY_UPLOAD === 'true' &&
  Boolean(process.env.SENTRY_AUTH_TOKEN) &&
  Boolean(process.env.SENTRY_ORG) &&
  Boolean(process.env.SENTRY_PROJECT);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(shouldUploadSourcemaps
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: {
              name: releaseId,
            },
            sourcemaps: {
              assets: './dist/**',
              filesToDeleteAfterUpload: ['dist/**/*.map'],
            },
            telemetry: false,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_RELEASE_ID__: JSON.stringify(releaseId),
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
});
