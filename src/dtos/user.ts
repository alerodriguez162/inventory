import { z } from 'zod';
import { userRoleSchema } from './common';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export const userResponseSchema = z.object({
  _id: z.string(),
  email: z.string(),
  role: userRoleSchema,
  isActive: z.boolean(),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  isActive: z.string().transform(Boolean).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserResponseDto = z.infer<typeof userResponseSchema>;
export type UserListQueryDto = z.infer<typeof userListQuerySchema>;
