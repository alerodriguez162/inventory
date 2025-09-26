import { Schema, model } from 'mongoose';
import { ISalesOrder, ISalesOrderLine, SalesOrderStatus } from '../types';

const salesOrderLineSchema = new Schema<ISalesOrderLine>(
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const salesOrderSchema = new Schema<ISalesOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    lines: [salesOrderLineSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'fulfilled', 'cancelled'],
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
    fulfilledDate: {
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
salesOrderSchema.index({ orderNumber: 1 });
salesOrderSchema.index({ 'customer.name': 'text', 'customer.email': 'text' });
salesOrderSchema.index({ status: 1 });
salesOrderSchema.index({ orderDate: -1 });
salesOrderSchema.index({ createdBy: 1 });
salesOrderSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total amount
salesOrderSchema.pre('save', function (next) {
  if (this.isModified('lines')) {
    this.totalAmount = this.lines.reduce((total, line) => total + line.totalPrice, 0);
  }
  next();
});

// Pre-save middleware to calculate line totals
salesOrderSchema.pre('save', function (next) {
  if (this.isModified('lines')) {
    this.lines.forEach((line) => {
      line.totalPrice = line.quantity * line.unitPrice;
    });
  }
  next();
});

// Static method to generate order number
salesOrderSchema.statics.generateOrderNumber = async function (): Promise<string> {
  const count = await this.countDocuments();
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequence = String(count + 1).padStart(4, '0');
  return `SO-${year}${month}-${sequence}`;
};

export const SalesOrder = model<ISalesOrder>('SalesOrder', salesOrderSchema);
