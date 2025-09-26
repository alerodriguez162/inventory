import { z } from 'zod';
import { UserRole, OrderStatus, SalesOrderStatus, StockMovementType, StockMovementReason, SupplierStatus } from '../types';

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export const idSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export const userRoleSchema = z.enum(['admin', 'manager', 'viewer']);

export const orderStatusSchema = z.enum(['draft', 'approved', 'received', 'cancelled']);

export const salesOrderStatusSchema = z.enum(['draft', 'confirmed', 'fulfilled', 'cancelled']);

export const stockMovementTypeSchema = z.enum(['in', 'out']);

export const stockMovementReasonSchema = z.enum(['purchase', 'sale', 'adjustment', 'transfer']);

export const supplierStatusSchema = z.enum(['active', 'inactive', 'suspended']);

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type IdParams = z.infer<typeof idSchema>;
