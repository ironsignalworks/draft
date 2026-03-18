import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { __resetApiClientState, fetchValidated } from './api';

const Schema = z.object({
  id: z.string(),
  name: z.string(),
});

describe('fetchValidated', () => {
  beforeEach(() => {
    __resetApiClientState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns validated data for valid payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 'u1', name: 'Taylor' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const result = await fetchValidated('/api/user', Schema);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: 'u1', name: 'Taylor' });
  });

  it('returns INVALID_PAYLOAD for schema mismatch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: 1, name: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const result = await fetchValidated('/api/user', Schema);

    expect(result.data).toBeNull();
    expect(result.error).toBe('INVALID_PAYLOAD');
  });

  it('returns HTTP status error for non-2xx responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    const result = await fetchValidated('/api/user', Schema);

    expect(result.data).toBeNull();
    expect(result.error).toBe('HTTP_500');
  });

  it('returns NETWORK_ERROR when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failed')));

    const result = await fetchValidated('/api/user', Schema);

    expect(result.data).toBeNull();
    expect(result.error).toBe('NETWORK_ERROR');
  });

  it('retries with backoff on transient HTTP 500 errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'u2', name: 'Retry User' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchValidated('/api/user', Schema, {
      retries: 2,
      cacheTtlMs: 0,
    });

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: 'u2', name: 'Retry User' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses response cache to avoid duplicate backend calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'cached', name: 'Cached User' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const first = await fetchValidated('/api/user', Schema, { cacheTtlMs: 5000 });
    const second = await fetchValidated('/api/user', Schema, { cacheTtlMs: 5000 });

    expect(first.error).toBeNull();
    expect(second.error).toBeNull();
    expect(second.data).toEqual({ id: 'cached', name: 'Cached User' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
