import { Document, Types } from 'mongoose';
import { UserRole, OrderStatus, SalesOrderStatus, StockMovementType, StockMovementReason, SupplierStatus } from './common';

// Base entity interface
export interface BaseEntity {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User entity
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

// Product entity
export interface IProduct extends Document {
  _id: Types.ObjectId;
  sku: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  unit: string;
  isActive: boolean;
  attributes?: Record<string, unknown>;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Warehouse entity
export interface IWarehouse extends Document {
  _id: Types.ObjectId;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier entity
export interface ISupplier extends Document {
  _id: Types.ObjectId;
  name: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: SupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Order Line Item
export interface IPurchaseOrderLine {
  product: Types.ObjectId;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

// Purchase Order entity
export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  supplier: Types.ObjectId;
  lines: IPurchaseOrderLine[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Sales Order Line Item
export interface ISalesOrderLine {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Sales Order entity
export interface ISalesOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  lines: ISalesOrderLine[];
  totalAmount: number;
  status: SalesOrderStatus;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  fulfilledDate?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Stock Movement entity
export interface IStockMovement extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  warehouse: Types.ObjectId;
  type: StockMovementType;
  quantity: number;
  reason: StockMovementReason;
  referenceDocument?: {
    type: 'purchase_order' | 'sales_order' | 'adjustment' | 'transfer';
    id: Types.ObjectId;
  };
  notes?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log entity
export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  entity: string;
  entityId: Types.ObjectId;
  action: string;
  payloadBefore?: Record<string, unknown>;
  payloadAfter?: Record<string, unknown>;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

// Stock Level (computed)
export interface IStockLevel {
  product: Types.ObjectId;
  warehouse: Types.ObjectId;
  quantity: number;
  lastUpdated: Date;
}

// Transfer entity (for stock transfers)
export interface IStockTransfer extends Document {
  _id: Types.ObjectId;
  fromWarehouse: Types.ObjectId;
  toWarehouse: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
