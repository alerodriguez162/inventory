import { BaseRepository } from './BaseRepository';
import { SalesOrder, ISalesOrder } from '../models';
import { SalesOrderStatus } from '../types';

export class SalesOrderRepository extends BaseRepository<ISalesOrder> {
  constructor() {
    super(SalesOrder);
  }

  async findByOrderNumber(orderNumber: string): Promise<ISalesOrder | null> {
    return this.model.findOne({ orderNumber });
  }

  async findByCustomer(customerName: string): Promise<ISalesOrder[]> {
    return this.model.find({ 'customer.name': { $regex: customerName, $options: 'i' } });
  }

  async findByStatus(status: SalesOrderStatus): Promise<ISalesOrder[]> {
    return this.model.find({ status });
  }

  async findByCreatedBy(userId: string): Promise<ISalesOrder[]> {
    return this.model.find({ createdBy: userId });
  }

  async findPendingConfirmation(): Promise<ISalesOrder[]> {
    return this.model.find({ status: 'draft' });
  }

  async findConfirmed(): Promise<ISalesOrder[]> {
    return this.model.find({ status: 'confirmed' });
  }

  async searchSalesOrders(query: string, pagination: any): Promise<any> {
    const searchFields = ['orderNumber', 'customer.name', 'customer.email', 'notes'];
    const filter = {};
    return this.findWithSearch(filter, searchFields, query, pagination);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ISalesOrder[]> {
    return this.model.find({
      orderDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  async getTotalAmountByCustomer(customerName: string): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { 'customer.name': customerName } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }
}
