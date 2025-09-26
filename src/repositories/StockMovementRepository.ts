import { BaseRepository } from './BaseRepository';
import { StockMovement, IStockMovement } from '../models';
import { StockMovementType, StockMovementReason } from '../types';
import { Types } from 'mongoose';

export class StockMovementRepository extends BaseRepository<IStockMovement> {
  constructor() {
    super(StockMovement);
  }

  async findByProduct(productId: string): Promise<IStockMovement[]> {
    return this.model.find({ product: productId });
  }

  async findByWarehouse(warehouseId: string): Promise<IStockMovement[]> {
    return this.model.find({ warehouse: warehouseId });
  }

  async findByProductAndWarehouse(productId: string, warehouseId: string): Promise<IStockMovement[]> {
    return this.model.find({ product: productId, warehouse: warehouseId });
  }

  async findByType(type: StockMovementType): Promise<IStockMovement[]> {
    return this.model.find({ type });
  }

  async findByReason(reason: StockMovementReason): Promise<IStockMovement[]> {
    return this.model.find({ reason });
  }

  async findByPerformedBy(userId: string): Promise<IStockMovement[]> {
    return this.model.find({ performedBy: userId });
  }

  async getStockLevel(productId: string, warehouseId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          product: new Types.ObjectId(productId),
          warehouse: new Types.ObjectId(warehouseId),
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
  }

  async getStockLevelsByWarehouse(warehouseId: string): Promise<Array<{ product: string; stockLevel: number }>> {
    const result = await this.model.aggregate([
      {
        $match: {
          warehouse: new Types.ObjectId(warehouseId),
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

    return result;
  }

  async getStockLevelsByProduct(productId: string): Promise<Array<{ warehouse: string; stockLevel: number }>> {
    const result = await this.model.aggregate([
      {
        $match: {
          product: new Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: '$warehouse',
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
          warehouse: '$_id',
          stockLevel: { $subtract: ['$totalIn', '$totalOut'] },
          _id: 0,
        },
      },
    ]);

    return result;
  }

  async searchStockMovements(query: string, pagination: any): Promise<any> {
    const searchFields = ['notes'];
    const filter = {};
    return this.findWithSearch(filter, searchFields, query, pagination);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<IStockMovement[]> {
    return this.model.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  async findByReferenceDocument(type: string, id: string): Promise<IStockMovement[]> {
    return this.model.find({
      'referenceDocument.type': type,
      'referenceDocument.id': id
    });
  }
}
