import { z } from 'zod';
import { stockMovementTypeSchema, stockMovementReasonSchema } from './common';

export const createStockMovementSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  warehouse: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ID'),
  type: stockMovementTypeSchema,
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: stockMovementReasonSchema,
  referenceDocument: z.object({
    type: z.enum(['purchase_order', 'sales_order', 'adjustment', 'transfer']),
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reference document ID'),
  }).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const stockAdjustmentSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  warehouse: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().min(1, 'Notes are required for adjustments').max(1000, 'Notes must be less than 1000 characters'),
});

export const stockTransferSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  fromWarehouse: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid from warehouse ID'),
  toWarehouse: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid to warehouse ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export const stockMovementResponseSchema = z.object({
  _id: z.string(),
  product: z.string(),
  warehouse: z.string(),
  type: stockMovementTypeSchema,
  quantity: z.number(),
  reason: stockMovementReasonSchema,
  referenceDocument: z.object({
    type: z.enum(['purchase_order', 'sales_order', 'adjustment', 'transfer']),
    id: z.string(),
  }).optional(),
  notes: z.string().optional(),
  performedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const stockMovementListQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID').optional(),
  warehouse: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ID').optional(),
  type: stockMovementTypeSchema.optional(),
  reason: stockMovementReasonSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const stockLevelQuerySchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID').optional(),
  warehouse: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ID').optional(),
});

export const stockLevelResponseSchema = z.object({
  product: z.string(),
  warehouse: z.string(),
  quantity: z.number(),
  lastUpdated: z.date(),
});

export type CreateStockMovementDto = z.infer<typeof createStockMovementSchema>;
export type StockAdjustmentDto = z.infer<typeof stockAdjustmentSchema>;
export type StockTransferDto = z.infer<typeof stockTransferSchema>;
export type StockMovementResponseDto = z.infer<typeof stockMovementResponseSchema>;
export type StockMovementListQueryDto = z.infer<typeof stockMovementListQuerySchema>;
export type StockLevelQueryDto = z.infer<typeof stockLevelQuerySchema>;
export type StockLevelResponseDto = z.infer<typeof stockLevelResponseSchema>;
