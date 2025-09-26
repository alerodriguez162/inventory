import { BaseRepository } from './BaseRepository';
import { PurchaseOrder, IPurchaseOrder } from '../models';
import { OrderStatus } from '../types';

export class PurchaseOrderRepository extends BaseRepository<IPurchaseOrder> {
  constructor() {
    super(PurchaseOrder);
  }

  async findByOrderNumber(orderNumber: string): Promise<IPurchaseOrder | null> {
    return this.model.findOne({ orderNumber });
  }

  async findBySupplier(supplierId: string): Promise<IPurchaseOrder[]> {
    return this.model.find({ supplier: supplierId });
  }

  async findByStatus(status: OrderStatus): Promise<IPurchaseOrder[]> {
    return this.model.find({ status });
  }

  async findByCreatedBy(userId: string): Promise<IPurchaseOrder[]> {
    return this.model.find({ createdBy: userId });
  }

  async findPendingApproval(): Promise<IPurchaseOrder[]> {
    return this.model.find({ status: 'draft' });
  }

  async findApproved(): Promise<IPurchaseOrder[]> {
    return this.model.find({ status: 'approved' });
  }

  async searchPurchaseOrders(query: string, pagination: any): Promise<any> {
    const searchFields = ['orderNumber', 'notes'];
    const filter = {};
    return this.findWithSearch(filter, searchFields, query, pagination);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<IPurchaseOrder[]> {
    return this.model.find({
      orderDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  async getTotalAmountBySupplier(supplierId: string): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { supplier: supplierId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }
}
