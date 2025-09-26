import { Schema, model } from 'mongoose';
import { ISupplier, SupplierStatus } from '../types';

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contact: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: 'USA',
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
supplierSchema.index({ name: 'text' });
supplierSchema.index({ 'contact.email': 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ createdAt: -1 });

// Static method to find active suppliers
supplierSchema.statics.findActive = function () {
  return this.find({ status: 'active' });
};

export const Supplier = model<ISupplier>('Supplier', supplierSchema);
