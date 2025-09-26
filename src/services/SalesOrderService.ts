import { SalesOrderRepository, ProductRepository, StockMovementRepository, AuditLogRepository, StockMovementRepository as StockRepo } from '../repositories';
import { CreateSalesOrderDto, UpdateSalesOrderDto, SalesOrderListQueryDto, ConfirmSalesOrderDto, FulfillSalesOrderDto } from '../dtos';
import { NotFoundError, BadRequestError, InsufficientStockError } from '../utils/errors';
import { SalesOrderStatus } from '../types';
import { Types } from 'mongoose';

export class SalesOrderService {
  private salesOrderRepository: SalesOrderRepository;
  private productRepository: ProductRepository;
  private stockMovementRepository: StockMovementRepository;
  private stockService: StockRepo;
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.salesOrderRepository = new SalesOrderRepository();
    this.productRepository = new ProductRepository();
    this.stockMovementRepository = new StockMovementRepository();
    this.stockService = new StockRepo();
    this.auditLogRepository = new AuditLogRepository();
  }

  async createSalesOrder(data: CreateSalesOrderDto, createdBy: string): Promise<any> {
    const { lines, ...orderData } = data;

    // Verify all products exist and are active
    for (const line of lines) {
      const product = await this.productRepository.findById(line.product);
      if (!product || !product.isActive || product.isDeleted) {
        throw new NotFoundError(`Product ${line.product}`);
      }
    }

    // Generate order number
    const orderNumber = await this.salesOrderRepository.model.generateOrderNumber();

    // Create sales order
    const salesOrder = await this.salesOrderRepository.create({
      orderNumber,
      lines: lines.map(line => ({
        product: new Types.ObjectId(line.product),
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.quantity * line.unitPrice,
      })),
      totalAmount: lines.reduce((total, line) => total + (line.quantity * line.unitPrice), 0),
      status: 'draft',
      createdBy: new Types.ObjectId(createdBy),
      ...orderData,
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'SalesOrder',
      entityId: salesOrder._id.toString(),
      action: 'created',
      payloadAfter: salesOrder.toJSON(),
      performedBy: createdBy,
    });

    return salesOrder.toJSON();
  }

  async getSalesOrderById(id: string): Promise<any> {
    const salesOrder = await this.salesOrderRepository.findById(id);
    if (!salesOrder) {
      throw new NotFoundError('Sales Order');
    }
    return salesOrder.toJSON();
  }

  async updateSalesOrder(id: string, data: UpdateSalesOrderDto, updatedBy: string): Promise<any> {
    const salesOrder = await this.salesOrderRepository.findById(id);
    if (!salesOrder) {
      throw new NotFoundError('Sales Order');
    }

    // Can only update draft orders
    if (salesOrder.status !== 'draft') {
      throw new BadRequestError('Can only update draft sales orders');
    }

    // Verify products if lines are being changed
    if (data.lines) {
      for (const line of data.lines) {
        const product = await this.productRepository.findById(line.product);
        if (!product || !product.isActive || product.isDeleted) {
          throw new NotFoundError(`Product ${line.product}`);
        }
      }
    }

    const updatedOrder = await this.salesOrderRepository.updateById(id, data);

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'SalesOrder',
      entityId: id,
      action: 'updated',
      payloadBefore: salesOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: updatedBy,
    });

    return updatedOrder!.toJSON();
  }

  async confirmSalesOrder(id: string, data: ConfirmSalesOrderDto, confirmedBy: string): Promise<any> {
    const salesOrder = await this.salesOrderRepository.findById(id);
    if (!salesOrder) {
      throw new NotFoundError('Sales Order');
    }

    if (salesOrder.status !== 'draft') {
      throw new BadRequestError('Can only confirm draft sales orders');
    }

    // Check stock availability for each line item
    for (const line of salesOrder.lines) {
      // Note: In a real application, you'd need to specify which warehouse to check
      // For now, we'll assume there's a default warehouse or check all warehouses
      const stockLevel = await this.stockService.getStockLevel(
        line.product.toString(),
        'default-warehouse-id' // This should be configurable
      );
      
      if (stockLevel < line.quantity) {
        const product = await this.productRepository.findById(line.product);
        throw new InsufficientStockError(
          product?.name || 'Unknown product',
          stockLevel,
          line.quantity
        );
      }
    }

    const updatedOrder = await this.salesOrderRepository.updateById(id, {
      status: 'confirmed',
      notes: data.notes ? `${salesOrder.notes || ''}\nConfirmed: ${data.notes}`.trim() : salesOrder.notes,
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'SalesOrder',
      entityId: id,
      action: 'confirmed',
      payloadBefore: salesOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: confirmedBy,
    });

    return updatedOrder!.toJSON();
  }

  async fulfillSalesOrder(id: string, data: FulfillSalesOrderDto, fulfilledBy: string): Promise<any> {
    const salesOrder = await this.salesOrderRepository.findById(id);
    if (!salesOrder) {
      throw new NotFoundError('Sales Order');
    }

    if (salesOrder.status !== 'confirmed') {
      throw new BadRequestError('Can only fulfill confirmed sales orders');
    }

    // Update sales order status
    const updatedOrder = await this.salesOrderRepository.updateById(id, {
      status: 'fulfilled',
      fulfilledDate: data.fulfilledDate ? new Date(data.fulfilledDate) : new Date(),
      notes: data.notes ? `${salesOrder.notes || ''}\nFulfilled: ${data.notes}`.trim() : salesOrder.notes,
    });

    // Create stock movements for each line item
    for (const line of salesOrder.lines) {
      await this.stockMovementRepository.create({
        product: line.product,
        warehouse: new Types.ObjectId(), // You might want to specify a default warehouse
        type: 'out',
        quantity: line.quantity,
        reason: 'sale',
        referenceDocument: {
          type: 'sales_order',
          id: salesOrder._id,
        },
        notes: `Sold via sales order ${salesOrder.orderNumber}`,
        performedBy: new Types.ObjectId(fulfilledBy),
      });
    }

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'SalesOrder',
      entityId: id,
      action: 'fulfilled',
      payloadBefore: salesOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: fulfilledBy,
    });

    return updatedOrder!.toJSON();
  }

  async cancelSalesOrder(id: string, cancelledBy: string): Promise<any> {
    const salesOrder = await this.salesOrderRepository.findById(id);
    if (!salesOrder) {
      throw new NotFoundError('Sales Order');
    }

    if (salesOrder.status === 'fulfilled') {
      throw new BadRequestError('Cannot cancel fulfilled sales orders');
    }

    const updatedOrder = await this.salesOrderRepository.updateById(id, {
      status: 'cancelled',
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'SalesOrder',
      entityId: id,
      action: 'cancelled',
      payloadBefore: salesOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: cancelledBy,
    });

    return updatedOrder!.toJSON();
  }

  async getSalesOrders(query: SalesOrderListQueryDto): Promise<any> {
    const { search, status, dateFrom, dateTo, ...pagination } = query;
    
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (dateFrom || dateTo) {
      filter.orderDate = {};
      if (dateFrom) {
        filter.orderDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.orderDate.$lte = new Date(dateTo);
      }
    }
    
    if (search) {
      return this.salesOrderRepository.searchSalesOrders(search, pagination);
    }
    
    return this.salesOrderRepository.findPaginated(filter, pagination);
  }

  async deleteSalesOrder(id: string): Promise<void> {
    const salesOrder = await this.salesOrderRepository.findById(id);
    if (!salesOrder) {
      throw new NotFoundError('Sales Order');
    }

    if (salesOrder.status === 'fulfilled') {
      throw new BadRequestError('Cannot delete fulfilled sales orders');
    }

    await this.salesOrderRepository.deleteById(id);
  }
}
