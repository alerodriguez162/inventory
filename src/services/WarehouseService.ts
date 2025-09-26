import { WarehouseRepository } from '../repositories';
import { CreateWarehouseDto, UpdateWarehouseDto, WarehouseListQueryDto } from '../dtos';
import { NotFoundError, ConflictError } from '../utils/errors';

export class WarehouseService {
  private warehouseRepository: WarehouseRepository;

  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  async createWarehouse(data: CreateWarehouseDto): Promise<any> {
    const { name, ...warehouseData } = data;

    // Check if warehouse name already exists
    const existingWarehouse = await this.warehouseRepository.findByName(name);
    if (existingWarehouse) {
      throw new ConflictError('Warehouse name already exists');
    }

    const warehouse = await this.warehouseRepository.create(warehouseData);
    return warehouse.toJSON();
  }

  async getWarehouseById(id: string): Promise<any> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }
    return warehouse.toJSON();
  }

  async updateWarehouse(id: string, data: UpdateWarehouseDto): Promise<any> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }

    // Check if name is being changed and if it's already taken
    if (data.name && data.name !== warehouse.name) {
      const existingWarehouse = await this.warehouseRepository.findByName(data.name);
      if (existingWarehouse) {
        throw new ConflictError('Warehouse name already exists');
      }
    }

    const updatedWarehouse = await this.warehouseRepository.updateById(id, data);
    return updatedWarehouse!.toJSON();
  }

  async deleteWarehouse(id: string): Promise<void> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }

    await this.warehouseRepository.deleteById(id);
  }

  async getWarehouses(query: WarehouseListQueryDto): Promise<any> {
    const { search, isActive, ...pagination } = query;
    
    let filter: any = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    
    if (search) {
      return this.warehouseRepository.searchWarehouses(search, pagination);
    }
    
    return this.warehouseRepository.findPaginated(filter, pagination);
  }

  async getActiveWarehouses(): Promise<any[]> {
    const warehouses = await this.warehouseRepository.findActiveWarehouses();
    return warehouses.map(warehouse => warehouse.toJSON());
  }

  async getWarehouseByName(name: string): Promise<any> {
    const warehouse = await this.warehouseRepository.findByName(name);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }
    return warehouse.toJSON();
  }

  async getWarehousesByLocation(city: string, state: string): Promise<any[]> {
    const warehouses = await this.warehouseRepository.findByLocation(city, state);
    return warehouses.map(warehouse => warehouse.toJSON());
  }
}
