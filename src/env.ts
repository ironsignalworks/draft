import { z } from 'zod';

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim().length === 0) {
    return undefined;
  }
  return value;
};

const EnvSchema = z.object({
  VITE_SENTRY_DSN: z.preprocess(emptyStringToUndefined, z.string().default('')),
  VITE_SENTRY_ENV: z.preprocess(emptyStringToUndefined, z.string().default('development')),
  VITE_SENTRY_RELEASE: z.preprocess(emptyStringToUndefined, z.string().default('local')),
  VITE_LOGROCKET_ID: z.preprocess(emptyStringToUndefined, z.string().default('')),
  VITE_API_URL: z.preprocess(
    emptyStringToUndefined,
    z.string().url().default('http://localhost:5173'),
  ),
  VITE_APP_VERSION: z.preprocess(emptyStringToUndefined, z.string().default('0.0.0-dev')),
  VITE_ENABLE_MSW: z.preprocess(emptyStringToUndefined, z.enum(['true', 'false']).default('false')),
  VITE_FEATURE_NEW_UI: z.preprocess(
    emptyStringToUndefined,
    z.enum(['true', 'false']).default('false'),
  ),
});

const parsedEnv = EnvSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
