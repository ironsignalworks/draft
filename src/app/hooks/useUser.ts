import { useEffect, useState } from 'react';
import { UserSchema, type User } from '../schemas/user';
import { identifyUser } from '../lib/observability';
import { fetchValidated } from '../services/api';

export type UserLoadState = 'loading' | 'empty' | 'error' | 'success';

export interface UseUserResult {
  state: UserLoadState;
  data: User | null;
  error: string | null;
  refetch: () => void;
}

interface UseUserOptions {
  mode?: 'ok' | 'slow' | 'error' | 'invalid' | 'timeout' | 'empty';
  enabled?: boolean;
}

export function useUser(options: UseUserOptions = {}): UseUserResult {
  const [requestVersion, setRequestVersion] = useState(0);
  const [result, setResult] = useState<UseUserResult>({
    state: options.enabled === false ? 'empty' : 'loading',
    data: null,
    error: null,
    refetch: () => setRequestVersion((version) => version + 1),
  });

  useEffect(() => {
    let isCancelled = false;
    const refetch = () => setRequestVersion((version) => version + 1);

    if (options.enabled === false) {
      setResult({ state: 'empty', data: null, error: null, refetch });
      return () => {
        isCancelled = true;
      };
    }

    async function loadUser(): Promise<void> {
      setResult({ state: 'loading', data: null, error: null, refetch });
      const modeParam = options.mode ? `?mode=${options.mode}` : '';
      const response = await fetchValidated(`/api/user${modeParam}`, UserSchema);

      if (isCancelled) return;

      if (response.error) {
        setResult({ state: 'error', data: null, error: response.error, refetch });
        return;
      }

      if (!response.data) {
        setResult({ state: 'empty', data: null, error: null, refetch });
        return;
      }

      identifyUser(response.data.id, {
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      });
      setResult({ state: 'success', data: response.data, error: null, refetch });
    }

    void loadUser();

    return () => {
      isCancelled = true;
    };
  }, [options.enabled, options.mode, requestVersion]);

  return result;
}
