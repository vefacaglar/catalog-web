import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const currentUserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  role: z.string(),
});
export type CurrentUser = z.infer<typeof currentUserSchema>;
