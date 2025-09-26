import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200, 'Street must be less than 200 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
  zipCode: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code must be less than 20 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters').default('USA'),
});

export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(200, 'Warehouse name must be less than 200 characters'),
  address: addressSchema,
  isActive: z.boolean().default(true),
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(200, 'Warehouse name must be less than 200 characters').optional(),
  address: addressSchema.optional(),
  isActive: z.boolean().optional(),
});

export const warehouseResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  address: addressSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const warehouseListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  isActive: z.string().transform(Boolean).optional(),
});

export type CreateWarehouseDto = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseDto = z.infer<typeof updateWarehouseSchema>;
export type WarehouseResponseDto = z.infer<typeof warehouseResponseSchema>;
export type WarehouseListQueryDto = z.infer<typeof warehouseListQuerySchema>;
