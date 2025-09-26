import { Schema, model } from 'mongoose';
import { IStockMovement, StockMovementType, StockMovementReason } from '../types';

const stockMovementSchema = new Schema<IStockMovement>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    type: {
      type: String,
      enum: ['in', 'out'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      enum: ['purchase', 'sale', 'adjustment', 'transfer'],
      required: true,
    },
    referenceDocument: {
      type: {
        type: String,
        enum: ['purchase_order', 'sales_order', 'adjustment', 'transfer'],
      },
      id: {
        type: Schema.Types.ObjectId,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
stockMovementSchema.index({ product: 1, warehouse: 1 });
stockMovementSchema.index({ product: 1 });
stockMovementSchema.index({ warehouse: 1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ reason: 1 });
stockMovementSchema.index({ performedBy: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ 'referenceDocument.type': 1, 'referenceDocument.id': 1 });

// Compound index for stock level calculations
stockMovementSchema.index({ product: 1, warehouse: 1, type: 1, createdAt: 1 });

// Static method to get stock level for a product in a warehouse
stockMovementSchema.statics.getStockLevel = async function (
  productId: string,
  warehouseId: string
): Promise<number> {
  const result = await this.aggregate([
    {
      $match: {
        product: new Schema.Types.ObjectId(productId),
        warehouse: new Schema.Types.ObjectId(warehouseId),
      },
    },
    {
      $group: {
        _id: null,
        totalIn: {
          $sum: {
            $cond: [{ $eq: ['$type', 'in'] }, '$quantity', 0],
          },
        },
        totalOut: {
          $sum: {
            $cond: [{ $eq: ['$type', 'out'] }, '$quantity', 0],
          },
        },
      },
    },
    {
      $project: {
        stockLevel: { $subtract: ['$totalIn', '$totalOut'] },
      },
    },
  ]);

  return result.length > 0 ? result[0].stockLevel : 0;
};

// Static method to get stock levels for all products in a warehouse
stockMovementSchema.statics.getStockLevelsByWarehouse = async function (warehouseId: string) {
  return this.aggregate([
    {
      $match: {
        warehouse: new Schema.Types.ObjectId(warehouseId),
      },
    },
    {
      $group: {
        _id: '$product',
        totalIn: {
          $sum: {
            $cond: [{ $eq: ['$type', 'in'] }, '$quantity', 0],
          },
        },
        totalOut: {
          $sum: {
            $cond: [{ $eq: ['$type', 'out'] }, '$quantity', 0],
          },
        },
      },
    },
    {
      $project: {
        product: '$_id',
        stockLevel: { $subtract: ['$totalIn', '$totalOut'] },
        _id: 0,
      },
    },
  ]);
};

export const StockMovement = model<IStockMovement>('StockMovement', stockMovementSchema);
