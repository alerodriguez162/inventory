import { Schema, model } from 'mongoose';
import { IPurchaseOrder, IPurchaseOrderLine, OrderStatus } from '../types';

const purchaseOrderLineSchema = new Schema<IPurchaseOrderLine>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    lines: [purchaseOrderLineSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'received', 'cancelled'],
      default: 'draft',
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    receivedDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
purchaseOrderSchema.index({ orderNumber: 1 });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ createdBy: 1 });
purchaseOrderSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total amount
purchaseOrderSchema.pre('save', function (next) {
  if (this.isModified('lines')) {
    this.totalAmount = this.lines.reduce((total, line) => total + line.totalCost, 0);
  }
  next();
});

// Pre-save middleware to calculate line totals
purchaseOrderSchema.pre('save', function (next) {
  if (this.isModified('lines')) {
    this.lines.forEach((line) => {
      line.totalCost = line.quantity * line.unitCost;
    });
  }
  next();
});

// Static method to generate order number
purchaseOrderSchema.statics.generateOrderNumber = async function (): Promise<string> {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequence = String(count + 1).padStart(4, '0');
  return `PO-${year}${month}-${sequence}`;
};

export const PurchaseOrder = model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
