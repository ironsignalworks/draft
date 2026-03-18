import * as Sentry from '@sentry/react';
import LogRocket from 'logrocket';
import { env } from '../../env';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface EventMeta {
  [key: string]: JsonValue;
}

interface BrowserWithObservability extends Window {
  __draftTestError?: () => never;
}

const SLOW_API_THRESHOLD_MS = 1200;
const SLOW_RENDER_THRESHOLD_MS = 50;
const FALLBACK_SENTRY_DSN = 'https://6467f7b23719b0c9c53059437be916dd@o4511042308145152.ingest.de.sentry.io/4511060858699856';
const FALLBACK_LOGROCKET_ID = 'omzcft/draft-isw';
let sentryInitialized = false;
let logRocketInitialized = false;
let lastIdentifiedUserId: string | null = null;

interface IdentifyUserTraits {
  name?: string;
  email?: string;
  role?: string;
  subscriptionType?: string;
  [key: string]: string | number | boolean | undefined;
}

function getBrowserWindow(): BrowserWithObservability | null {
  return typeof window !== 'undefined' ? (window as BrowserWithObservability) : null;
}

export function captureError(error: unknown, context?: EventMeta): void {
  if (import.meta.env.DEV) {
    console.error('[observability] captured error', error, context ?? {});
  }

  Sentry.captureException(error, { extra: context });
  if (logRocketInitialized) {
    (LogRocket as { captureException?: (error: unknown) => void }).captureException?.(error);
  }
}

export function trackEvent(name: string, meta: EventMeta = {}): void {
  if (import.meta.env.DEV) {
    console.info(`[telemetry] ${name}`, meta);
  }

  if (logRocketInitialized) {
    LogRocket.track(name, meta as unknown as Record<string, string | number | boolean | null | undefined>);
  }
  Sentry.addBreadcrumb({
    category: 'ui.action',
    message: name,
    level: 'info',
    data: meta,
  });
}

export function trackPageView(page: string, meta: EventMeta = {}): void {
  trackEvent('page_view', { page, ...meta });
}

export function trackApiMetric(path: string, durationMs: number, status: 'ok' | 'error', meta: EventMeta = {}): void {
  const payload: EventMeta = {
    path,
    durationMs: Math.round(durationMs),
    status,
    slow: durationMs >= SLOW_API_THRESHOLD_MS,
    ...meta,
  };
  trackEvent('api_request', payload);
}

export function identifyUser(userId: string, traits: IdentifyUserTraits = {}): void {
  if (!userId || userId === lastIdentifiedUserId) {
    return;
  }
  const normalizedTraits = Object.fromEntries(
    Object.entries(traits).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;

  if (logRocketInitialized) {
    LogRocket.identify(userId, normalizedTraits);
  }

  if (sentryInitialized) {
    Sentry.setUser({
      id: userId,
      email: typeof normalizedTraits.email === 'string' ? normalizedTraits.email : undefined,
      username: typeof normalizedTraits.name === 'string' ? normalizedTraits.name : undefined,
    });
  }

  lastIdentifiedUserId = userId;
}

function initSessionReplay(): void {
  const browserWindow = getBrowserWindow();
  if (!browserWindow) return;
  if (import.meta.env.DEV) {
    console.info('[observability] session replay adapter active');
  }
}

function initPerformanceMonitoring(): void {
  const browserWindow = getBrowserWindow();
  if (!browserWindow || typeof PerformanceObserver === 'undefined') return;

  try {
    const longTaskObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.duration >= SLOW_RENDER_THRESHOLD_MS) {
          trackEvent('long_task', {
            name: entry.name || 'unknown',
            durationMs: Math.round(entry.duration),
          });
        }
      });
    });
    longTaskObserver.observe({ type: 'longtask', buffered: true });
  } catch {
    if (import.meta.env.DEV) {
      console.info('[observability] long task observer unavailable');
    }
  }

  if ('memory' in performance) {
    const memoryProbe = () => {
      const memory = (performance as Performance & {
        memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      }).memory;
      if (!memory) return;
      const usageRatio = memory.jsHeapSizeLimit > 0 ? memory.usedJSHeapSize / memory.jsHeapSizeLimit : 0;
      if (usageRatio >= 0.8) {
        trackEvent('memory_pressure', {
          usedBytes: memory.usedJSHeapSize,
          limitBytes: memory.jsHeapSizeLimit,
          ratio: Number(usageRatio.toFixed(3)),
        });
      }
    };

    globalThis.setInterval(memoryProbe, 30000);
  }
}

function initGlobalErrorHandlers(): void {
  const browserWindow = getBrowserWindow();
  if (!browserWindow) return;

  browserWindow.addEventListener('error', (event) => {
    captureError(event.error ?? event.message, {
      source: 'window.error',
      filename: event.filename ?? null,
      lineno: event.lineno ?? null,
      colno: event.colno ?? null,
    });
  });

  browserWindow.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, { source: 'window.unhandledrejection' });
  });

  if (import.meta.env.DEV) {
    browserWindow.__draftTestError = () => {
      throw new Error('Draft test error for monitoring verification');
    };
  }
}

export function initSentry(): void {
  if (sentryInitialized) return;

  const dsn = env.VITE_SENTRY_DSN || FALLBACK_SENTRY_DSN;
  if (!dsn) {
    if (import.meta.env.DEV) console.info('[observability] Sentry disabled (no DSN)');
    return;
  }

  Sentry.init({
    dsn,
    sendDefaultPii: true,
    environment: env.VITE_SENTRY_ENV,
    release: env.VITE_SENTRY_RELEASE || env.VITE_APP_VERSION,
  });

  sentryInitialized = true;

  Sentry.addBreadcrumb({
    category: 'release',
    message: 'sentry_init',
    level: 'info',
    data: {
      release: env.VITE_SENTRY_RELEASE,
      environment: env.VITE_SENTRY_ENV,
    },
  });

  if (import.meta.env.DEV) {
    console.info('[observability] Sentry initialized');
  }
}

export function initLogRocket(): void {
  if (logRocketInitialized) return;

  const logRocketId = env.VITE_LOGROCKET_ID || FALLBACK_LOGROCKET_ID;
  if (!logRocketId) {
    if (import.meta.env.DEV) console.info('[observability] LogRocket disabled (no VITE_LOGROCKET_ID)');
    return;
  }

  LogRocket.init(logRocketId);
  logRocketInitialized = true;

  if (import.meta.env.DEV) {
    console.info('[observability] LogRocket initialized');
  }
}

export function initObservability(): void {
  initSentry();
  initLogRocket();
  initSessionReplay();
  initGlobalErrorHandlers();
  initPerformanceMonitoring();
}
