import { BaseRepository } from './BaseRepository';
import { Supplier, ISupplier } from '../models';
import { SupplierStatus } from '../types';

export class SupplierRepository extends BaseRepository<ISupplier> {
  constructor() {
    super(Supplier);
  }

  async findByEmail(email: string): Promise<ISupplier | null> {
    return this.model.findOne({ 'contact.email': email.toLowerCase() });
  }

  async findActiveSuppliers(): Promise<ISupplier[]> {
    return this.model.find({ status: 'active' });
  }

  async findByStatus(status: SupplierStatus): Promise<ISupplier[]> {
    return this.model.find({ status });
  }

  async searchSuppliers(query: string, pagination: any): Promise<any> {
    const searchFields = ['name', 'contact.name', 'contact.email'];
    const filter = {};
    return this.findWithSearch(filter, searchFields, query, pagination);
  }
}
