import { describe, expect, it } from 'vitest';
import { PartialUserSchema, UserSchema } from './user';

describe('UserSchema', () => {
  it('accepts a valid payload', () => {
    const parsed = UserSchema.safeParse({
      id: 'user-1',
      name: 'Alex',
      email: 'alex@example.com',
      role: 'admin',
    });

    expect(parsed.success).toBe(true);
  });

  it('accepts a partial payload with PartialUserSchema', () => {
    const parsed = PartialUserSchema.safeParse({
      id: 'user-2',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid payload', () => {
    const parsed = UserSchema.safeParse({
      id: 101,
      name: null,
      email: 'not-an-email',
    });

    expect(parsed.success).toBe(false);
  });
});
