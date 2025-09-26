import { SupplierRepository } from '../repositories';
import { CreateSupplierDto, UpdateSupplierDto, SupplierListQueryDto } from '../dtos';
import { NotFoundError, ConflictError } from '../utils/errors';

export class SupplierService {
  private supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  async createSupplier(data: CreateSupplierDto): Promise<any> {
    const { contact, ...supplierData } = data;

    // Check if supplier email already exists
    const existingSupplier = await this.supplierRepository.findByEmail(contact.email);
    if (existingSupplier) {
      throw new ConflictError('Supplier email already exists');
    }

    const supplier = await this.supplierRepository.create({
      ...supplierData,
      contact: {
        ...contact,
        email: contact.email.toLowerCase(),
      },
    });

    return supplier.toJSON();
  }

  async getSupplierById(id: string): Promise<any> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier');
    }
    return supplier.toJSON();
  }

  async updateSupplier(id: string, data: UpdateSupplierDto): Promise<any> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier');
    }

    // Check if email is being changed and if it's already taken
    if (data.contact?.email && data.contact.email !== supplier.contact.email) {
      const existingSupplier = await this.supplierRepository.findByEmail(data.contact.email);
      if (existingSupplier) {
        throw new ConflictError('Supplier email already exists');
      }
    }

    const updateData: any = { ...data };
    if (data.contact?.email) {
      updateData.contact = {
        ...data.contact,
        email: data.contact.email.toLowerCase(),
      };
    }

    const updatedSupplier = await this.supplierRepository.updateById(id, updateData);
    return updatedSupplier!.toJSON();
  }

  async deleteSupplier(id: string): Promise<void> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError('Supplier');
    }

    await this.supplierRepository.deleteById(id);
  }

  async getSuppliers(query: SupplierListQueryDto): Promise<any> {
    const { search, status, ...pagination } = query;
    
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      return this.supplierRepository.searchSuppliers(search, pagination);
    }
    
    return this.supplierRepository.findPaginated(filter, pagination);
  }

  async getActiveSuppliers(): Promise<any[]> {
    const suppliers = await this.supplierRepository.findActiveSuppliers();
    return suppliers.map(supplier => supplier.toJSON());
  }

  async getSupplierByEmail(email: string): Promise<any> {
    const supplier = await this.supplierRepository.findByEmail(email);
    if (!supplier) {
      throw new NotFoundError('Supplier');
    }
    return supplier.toJSON();
  }

  async getSuppliersByStatus(status: string): Promise<any[]> {
    const suppliers = await this.supplierRepository.findByStatus(status as any);
    return suppliers.map(supplier => supplier.toJSON());
  }
}
