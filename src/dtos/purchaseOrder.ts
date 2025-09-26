import { z } from 'zod';
import { orderStatusSchema } from './common';

export const purchaseOrderLineSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
});

export const createPurchaseOrderSchema = z.object({
  supplier: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid supplier ID'),
  lines: z.array(purchaseOrderLineSchema).min(1, 'At least one line item is required'),
  expectedDeliveryDate: z.string().datetime().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const updatePurchaseOrderSchema = z.object({
  supplier: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid supplier ID').optional(),
  lines: z.array(purchaseOrderLineSchema).min(1, 'At least one line item is required').optional(),
  status: orderStatusSchema.optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  receivedDate: z.string().datetime().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const purchaseOrderLineResponseSchema = z.object({
  product: z.string(),
  quantity: z.number(),
  unitCost: z.number(),
  totalCost: z.number(),
});

export const purchaseOrderResponseSchema = z.object({
  _id: z.string(),
  orderNumber: z.string(),
  supplier: z.string(),
  lines: z.array(purchaseOrderLineResponseSchema),
  totalAmount: z.number(),
  status: orderStatusSchema,
  orderDate: z.date(),
  expectedDeliveryDate: z.date().optional(),
  receivedDate: z.date().optional(),
  notes: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const purchaseOrderListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: orderStatusSchema.optional(),
  supplier: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid supplier ID').optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const approvePurchaseOrderSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const receivePurchaseOrderSchema = z.object({
  receivedDate: z.string().datetime().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type CreatePurchaseOrderDto = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderDto = z.infer<typeof updatePurchaseOrderSchema>;
export type PurchaseOrderResponseDto = z.infer<typeof purchaseOrderResponseSchema>;
export type PurchaseOrderListQueryDto = z.infer<typeof purchaseOrderListQuerySchema>;
export type ApprovePurchaseOrderDto = z.infer<typeof approvePurchaseOrderSchema>;
export type ReceivePurchaseOrderDto = z.infer<typeof receivePurchaseOrderSchema>;
