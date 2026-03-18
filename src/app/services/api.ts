import { z } from 'zod';
import { env } from '../../env';
import { captureError, trackApiMetric } from '../lib/observability';

const API_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 2;
const DEFAULT_BACKOFF_MS = 300;
const MAX_BACKOFF_MS = 2000;
const DEFAULT_CACHE_TTL_MS = 15000;

type FetchResult<T> = { data: T | null; error: string | null };

interface CacheRecord {
  expiresAt: number;
  value: unknown;
}

export interface FetchValidatedOptions {
  retries?: number;
  timeoutMs?: number;
  cacheTtlMs?: number;
  cacheKey?: string;
}

const responseCache = new Map<string, CacheRecord>();
const inFlight = new Map<string, Promise<FetchResult<unknown>>>();
const lastRequestAt = new Map<string, number>();

export function __resetApiClientState(): void {
  responseCache.clear();
  inFlight.clear();
  lastRequestAt.clear();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function shouldRetry(status: number): boolean {
  return status === 429 || status >= 500;
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function getCached<T>(cacheKey: string): T | null {
  const now = Date.now();
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt <= now) {
    responseCache.delete(cacheKey);
    return null;
  }
  return cached.value as T;
}

function setCached<T>(cacheKey: string, value: T, ttlMs: number): void {
  responseCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + Math.max(0, ttlMs),
  });
}

async function fetchWithResilience<T>(
  path: string,
  schema: z.ZodSchema<T>,
  options: Required<FetchValidatedOptions>,
): Promise<FetchResult<T>> {
  const normalizedPath = normalizePath(path);
  const retries = Math.max(0, options.retries);
  const timeoutMs = Math.max(1000, options.timeoutMs);
  const cacheKey = options.cacheKey || normalizedPath;
  const cacheTtlMs = Math.max(0, options.cacheTtlMs);

  const cached = getCached<T>(cacheKey);
  if (cached) {
    trackApiMetric(normalizedPath, 0, 'ok', { source: 'cache' });
    return { data: cached, error: null };
  }

  const requestFactory = async (): Promise<FetchResult<T>> => {
    const start = performance.now();
    let attempt = 0;

    while (attempt <= retries) {
      const controller = new AbortController();
      const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${env.VITE_API_URL}${normalizedPath}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (attempt < retries && shouldRetry(response.status)) {
            const backoff = Math.min(MAX_BACKOFF_MS, DEFAULT_BACKOFF_MS * 2 ** attempt);
            await delay(backoff);
            attempt += 1;
            continue;
          }

          const duration = performance.now() - start;
          trackApiMetric(normalizedPath, duration, 'error', {
            error: `HTTP_${response.status}`,
            attempts: attempt + 1,
          });
          return { data: null, error: `HTTP_${response.status}` };
        }

        const data = (await response.json()) as unknown;
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
          const duration = performance.now() - start;
          trackApiMetric(normalizedPath, duration, 'error', {
            error: 'INVALID_PAYLOAD',
            attempts: attempt + 1,
          });
          return { data: null, error: 'INVALID_PAYLOAD' };
        }

        if (cacheTtlMs > 0) {
          setCached(cacheKey, parsed.data, cacheTtlMs);
        }

        const duration = performance.now() - start;
        trackApiMetric(normalizedPath, duration, 'ok', {
          attempts: attempt + 1,
        });
        return { data: parsed.data, error: null };
      } catch (error) {
        if (attempt < retries) {
          const backoff = Math.min(MAX_BACKOFF_MS, DEFAULT_BACKOFF_MS * 2 ** attempt);
          await delay(backoff);
          attempt += 1;
          continue;
        }

        const duration = performance.now() - start;
        trackApiMetric(normalizedPath, duration, 'error', {
          error: 'NETWORK_ERROR',
          attempts: attempt + 1,
        });
        captureError(error, {
          source: 'api.fetch',
          path: normalizedPath,
        });
        return { data: null, error: 'NETWORK_ERROR' };
      } finally {
        globalThis.clearTimeout(timeout);
      }
    }

    return { data: null, error: 'NETWORK_ERROR' };
  };

  const existing = inFlight.get(cacheKey);
  if (existing) {
    return (await existing) as FetchResult<T>;
  }

  const now = Date.now();
  const last = lastRequestAt.get(cacheKey) ?? 0;
  const elapsed = now - last;
  if (elapsed < 200) {
    await delay(200 - elapsed);
  }
  lastRequestAt.set(cacheKey, Date.now());

  const promise = requestFactory();
  inFlight.set(cacheKey, promise as Promise<FetchResult<unknown>>);

  try {
    return await promise;
  } finally {
    inFlight.delete(cacheKey);
  }
}

export async function fetchValidated<T>(
  path: string,
  schema: z.ZodSchema<T>,
  options: FetchValidatedOptions = {},
): Promise<FetchResult<T>> {
  return fetchWithResilience(path, schema, {
    retries: options.retries ?? DEFAULT_RETRIES,
    timeoutMs: options.timeoutMs ?? API_TIMEOUT_MS,
    cacheTtlMs: options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS,
    cacheKey: options.cacheKey ?? normalizePath(path),
  });
}
