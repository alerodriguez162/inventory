import { z } from 'zod';
import { salesOrderStatusSchema } from './common';

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(200, 'Customer name must be less than 200 characters'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
});

export const salesOrderLineSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});

export const createSalesOrderSchema = z.object({
  customer: customerSchema,
  lines: z.array(salesOrderLineSchema).min(1, 'At least one line item is required'),
  expectedDeliveryDate: z.string().datetime().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const updateSalesOrderSchema = z.object({
  customer: customerSchema.optional(),
  lines: z.array(salesOrderLineSchema).min(1, 'At least one line item is required').optional(),
  status: salesOrderStatusSchema.optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  fulfilledDate: z.string().datetime().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const salesOrderLineResponseSchema = z.object({
  product: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
});

export const salesOrderResponseSchema = z.object({
  _id: z.string(),
  orderNumber: z.string(),
  customer: customerSchema,
  lines: z.array(salesOrderLineResponseSchema),
  totalAmount: z.number(),
  status: salesOrderStatusSchema,
  orderDate: z.date(),
  expectedDeliveryDate: z.date().optional(),
  fulfilledDate: z.date().optional(),
  notes: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const salesOrderListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: salesOrderStatusSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const confirmSalesOrderSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const fulfillSalesOrderSchema = z.object({
  fulfilledDate: z.string().datetime().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type CreateSalesOrderDto = z.infer<typeof createSalesOrderSchema>;
export type UpdateSalesOrderDto = z.infer<typeof updateSalesOrderSchema>;
export type SalesOrderResponseDto = z.infer<typeof salesOrderResponseSchema>;
export type SalesOrderListQueryDto = z.infer<typeof salesOrderListQuerySchema>;
export type ConfirmSalesOrderDto = z.infer<typeof confirmSalesOrderSchema>;
export type FulfillSalesOrderDto = z.infer<typeof fulfillSalesOrderSchema>;
