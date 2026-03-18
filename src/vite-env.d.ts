/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENV?: string;
  readonly VITE_SENTRY_RELEASE?: string;
  readonly VITE_LOGROCKET_ID?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_ENABLE_MSW?: 'true' | 'false';
  readonly VITE_FEATURE_NEW_UI?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __APP_RELEASE_ID__: string;
