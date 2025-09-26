import { BaseRepository } from './BaseRepository';
import { Product, IProduct } from '../models';

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  async findBySku(sku: string): Promise<IProduct | null> {
    return this.model.findOne({ sku: sku.toUpperCase() });
  }

  async findActiveProducts(): Promise<IProduct[]> {
    return this.model.find({ isActive: true, isDeleted: false });
  }

  async findByCategory(category: string): Promise<IProduct[]> {
    return this.model.find({ category, isActive: true, isDeleted: false });
  }

  async softDelete(id: string, reason: string): Promise<IProduct | null> {
    return this.model.findByIdAndUpdate(
      id,
      { 
        isDeleted: true, 
        deletedAt: new Date(),
        $set: { 'attributes.deletionReason': reason }
      },
      { new: true }
    );
  }

  async restore(id: string): Promise<IProduct | null> {
    return this.model.findByIdAndUpdate(
      id,
      { 
        isDeleted: false, 
        deletedAt: null,
        $unset: { 'attributes.deletionReason': 1 }
      },
      { new: true }
    );
  }

  async searchProducts(query: string, pagination: any): Promise<any> {
    const searchFields = ['name', 'sku', 'category'];
    const filter = { isDeleted: false };
    return this.findWithSearch(filter, searchFields, query, pagination);
  }

  async findProductsWithStock(warehouseId: string): Promise<IProduct[]> {
    // This would typically involve aggregation with stock movements
    // For now, return active products
    return this.model.find({ isActive: true, isDeleted: false });
  }
}
