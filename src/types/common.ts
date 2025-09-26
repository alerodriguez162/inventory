export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface FilterQuery extends PaginationQuery {
  [key: string]: unknown;
}

export type UserRole = 'admin' | 'manager' | 'viewer';

export type OrderStatus = 'draft' | 'approved' | 'received' | 'cancelled';

export type SalesOrderStatus = 'draft' | 'confirmed' | 'fulfilled' | 'cancelled';

export type StockMovementType = 'in' | 'out';

export type StockMovementReason = 'purchase' | 'sale' | 'adjustment' | 'transfer';

export type SupplierStatus = 'active' | 'inactive' | 'suspended';
