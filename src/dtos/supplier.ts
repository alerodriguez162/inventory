import { z } from 'zod';
import { supplierStatusSchema } from './common';

export const contactSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(200, 'Contact name must be less than 200 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200, 'Street must be less than 200 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
  zipCode: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code must be less than 20 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters').default('USA'),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(200, 'Supplier name must be less than 200 characters'),
  contact: contactSchema,
  address: addressSchema.optional(),
  status: supplierStatusSchema.default('active'),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(200, 'Supplier name must be less than 200 characters').optional(),
  contact: contactSchema.optional(),
  address: addressSchema.optional(),
  status: supplierStatusSchema.optional(),
});

export const supplierResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  contact: contactSchema,
  address: addressSchema.optional(),
  status: supplierStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const supplierListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: supplierStatusSchema.optional(),
});

export type CreateSupplierDto = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof updateSupplierSchema>;
export type SupplierResponseDto = z.infer<typeof supplierResponseSchema>;
export type SupplierListQueryDto = z.infer<typeof supplierListQuerySchema>;
