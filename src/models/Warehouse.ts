import { Schema, model } from 'mongoose';
import { IWarehouse } from '../types';

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'USA',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
warehouseSchema.index({ name: 1 });
warehouseSchema.index({ isActive: 1 });
warehouseSchema.index({ 'address.city': 1, 'address.state': 1 });

// Static method to find active warehouses
warehouseSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

export const Warehouse = model<IWarehouse>('Warehouse', warehouseSchema);
