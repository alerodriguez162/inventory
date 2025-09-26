import { BaseRepository } from './BaseRepository';
import { Warehouse, IWarehouse } from '../models';

export class WarehouseRepository extends BaseRepository<IWarehouse> {
  constructor() {
    super(Warehouse);
  }

  async findByName(name: string): Promise<IWarehouse | null> {
    return this.model.findOne({ name });
  }

  async findActiveWarehouses(): Promise<IWarehouse[]> {
    return this.model.find({ isActive: true });
  }

  async findByLocation(city: string, state: string): Promise<IWarehouse[]> {
    return this.model.find({
      'address.city': city,
      'address.state': state,
      isActive: true
    });
  }

  async searchWarehouses(query: string, pagination: any): Promise<any> {
    const searchFields = ['name', 'address.street', 'address.city', 'address.state'];
    const filter = {};
    return this.findWithSearch(filter, searchFields, query, pagination);
  }
}
