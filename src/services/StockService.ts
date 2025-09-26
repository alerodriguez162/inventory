import { StockMovementRepository, ProductRepository, WarehouseRepository, AuditLogRepository } from '../repositories';
import { stockAdjustmentSchema, stockTransferSchema, stockLevelQuerySchema } from '../dtos';
import { NotFoundError, InsufficientStockError, BadRequestError } from '../utils/errors';
import { StockMovementType, StockMovementReason } from '../types';
import { Types } from 'mongoose';

export class StockService {
  private stockMovementRepository: StockMovementRepository;
  private productRepository: ProductRepository;
  private warehouseRepository: WarehouseRepository;
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.stockMovementRepository = new StockMovementRepository();
    this.productRepository = new ProductRepository();
    this.warehouseRepository = new WarehouseRepository();
    this.auditLogRepository = new AuditLogRepository();
  }

  async getStockLevel(productId: string, warehouseId: string): Promise<number> {
    // Verify product and warehouse exist
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }

    return this.stockMovementRepository.getStockLevel(productId, warehouseId);
  }

  async getStockLevelsByWarehouse(warehouseId: string): Promise<any[]> {
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new NotFoundError('Warehouse');
    }

    return this.stockMovementRepository.getStockLevelsByWarehouse(warehouseId);
  }

  async getStockLevelsByProduct(productId: string): Promise<any[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product');
    }

    return this.stockMovementRepository.getStockLevelsByProduct(productId);
  }

  async getAllStockLevels(query: StockLevelQueryDto): Promise<any[]> {
    if (query.product && query.warehouse) {
      const level = await this.getStockLevel(query.product, query.warehouse);
      return [{ product: query.product, warehouse: query.warehouse, quantity: level }];
    }

    if (query.product) {
      return this.getStockLevelsByProduct(query.product);
    }

    if (query.warehouse) {
      return this.getStockLevelsByWarehouse(query.warehouse);
    }

    // If no filters, return empty array (in a real app, you might want to return all stock levels)
    return [];
  }

  async adjustStock(data: any, performedBy: string): Promise<any> {
    const { product, warehouse, quantity, notes } = data;

    // Verify product and warehouse exist
    const productDoc = await this.productRepository.findById(product);
    if (!productDoc) {
      throw new NotFoundError('Product');
    }

    const warehouseDoc = await this.warehouseRepository.findById(warehouse);
    if (!warehouseDoc) {
      throw new NotFoundError('Warehouse');
    }

    // Get current stock level
    const currentStock = await this.getStockLevel(product, warehouse);

    // Create stock movement
    const stockMovement = await this.stockMovementRepository.create({
      product: new Types.ObjectId(product),
      warehouse: new Types.ObjectId(warehouse),
      type: 'in', // Adjustments are always positive
      quantity,
      reason: 'adjustment',
      notes,
      performedBy: new Types.ObjectId(performedBy),
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'StockMovement',
      entityId: stockMovement._id.toString(),
      action: 'adjustment',
      payloadBefore: { stockLevel: currentStock },
      payloadAfter: { stockLevel: currentStock + quantity },
      performedBy,
    });

    return stockMovement.toJSON();
  }

  async transferStock(data: any, performedBy: string): Promise<any> {
    const { product, fromWarehouse, toWarehouse, quantity, notes } = data;

    // Verify product exists
    const productDoc = await this.productRepository.findById(product);
    if (!productDoc) {
      throw new NotFoundError('Product');
    }

    // Verify warehouses exist
    const fromWarehouseDoc = await this.warehouseRepository.findById(fromWarehouse);
    if (!fromWarehouseDoc) {
      throw new NotFoundError('From warehouse');
    }

    const toWarehouseDoc = await this.warehouseRepository.findById(toWarehouse);
    if (!toWarehouseDoc) {
      throw new NotFoundError('To warehouse');
    }

    // Check if transferring to same warehouse
    if (fromWarehouse === toWarehouse) {
      throw new BadRequestError('Cannot transfer to the same warehouse');
    }

    // Get current stock level in source warehouse
    const currentStock = await this.getStockLevel(product, fromWarehouse);
    if (currentStock < quantity) {
      throw new InsufficientStockError(productDoc.name, currentStock, quantity);
    }

    // Create outbound movement
    const outboundMovement = await this.stockMovementRepository.create({
      product: new Types.ObjectId(product),
      warehouse: new Types.ObjectId(fromWarehouse),
      type: 'out',
      quantity,
      reason: 'transfer',
      referenceDocument: {
        type: 'transfer',
        id: new Types.ObjectId(), // Generate a transfer ID
      },
      notes: `Transfer to ${toWarehouseDoc.name}. ${notes || ''}`,
      performedBy: new Types.ObjectId(performedBy),
    });

    // Create inbound movement
    const inboundMovement = await this.stockMovementRepository.create({
      product: new Types.ObjectId(product),
      warehouse: new Types.ObjectId(toWarehouse),
      type: 'in',
      quantity,
      reason: 'transfer',
      referenceDocument: {
        type: 'transfer',
        id: outboundMovement._id,
      },
      notes: `Transfer from ${fromWarehouseDoc.name}. ${notes || ''}`,
      performedBy: new Types.ObjectId(performedBy),
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'StockTransfer',
      entityId: outboundMovement._id.toString(),
      action: 'transfer',
      payloadBefore: { 
        fromWarehouse, 
        toWarehouse, 
        quantity: 0 
      },
      payloadAfter: { 
        fromWarehouse, 
        toWarehouse, 
        quantity 
      },
      performedBy,
    });

    return {
      outboundMovement: outboundMovement.toJSON(),
      inboundMovement: inboundMovement.toJSON(),
    };
  }

  async getStockMovements(query: any): Promise<any> {
    const { product, warehouse, type, reason, dateFrom, dateTo, ...pagination } = query;
    
    let filter: any = {};
    
    if (product) {
      filter.product = new Types.ObjectId(product);
    }
    
    if (warehouse) {
      filter.warehouse = new Types.ObjectId(warehouse);
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (reason) {
      filter.reason = reason;
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }
    
    if (query.search) {
      return this.stockMovementRepository.searchStockMovements(query.search, pagination);
    }
    
    return this.stockMovementRepository.findPaginated(filter, pagination);
  }
}
