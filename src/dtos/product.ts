import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be less than 50 characters'),
  name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters'),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  cost: z.number().min(0, 'Cost must be non-negative'),
  price: z.number().min(0, 'Price must be non-negative'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters'),
  isActive: z.boolean().default(true),
  attributes: z.record(z.unknown()).optional(),
});

export const updateProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be less than 50 characters').optional(),
  name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters').optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters').optional(),
  cost: z.number().min(0, 'Cost must be non-negative').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters').optional(),
  isActive: z.boolean().optional(),
  attributes: z.record(z.unknown()).optional(),
});

export const productResponseSchema = z.object({
  _id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  cost: z.number(),
  price: z.number(),
  unit: z.string(),
  isActive: z.boolean(),
  attributes: z.record(z.unknown()).optional(),
  isDeleted: z.boolean(),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.string().transform(Boolean).optional(),
  includeDeleted: z.string().transform(Boolean).optional(),
});

export const softDeleteProductSchema = z.object({
  reason: z.string().min(1, 'Deletion reason is required').max(500, 'Reason must be less than 500 characters'),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductResponseDto = z.infer<typeof productResponseSchema>;
export type ProductListQueryDto = z.infer<typeof productListQuerySchema>;
export type SoftDeleteProductDto = z.infer<typeof softDeleteProductSchema>;
