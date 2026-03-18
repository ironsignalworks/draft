import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export const PartialUserSchema = UserSchema.partial();

export type User = z.infer<typeof UserSchema>;
