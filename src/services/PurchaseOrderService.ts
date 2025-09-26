import { PurchaseOrderRepository, ProductRepository, SupplierRepository, StockMovementRepository, AuditLogRepository } from '../repositories';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderListQueryDto, ApprovePurchaseOrderDto, ReceivePurchaseOrderDto } from '../dtos';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { OrderStatus } from '../types';
import { Types } from 'mongoose';

export class PurchaseOrderService {
  private purchaseOrderRepository: PurchaseOrderRepository;
  private productRepository: ProductRepository;
  private supplierRepository: SupplierRepository;
  private stockMovementRepository: StockMovementRepository;
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.purchaseOrderRepository = new PurchaseOrderRepository();
    this.productRepository = new ProductRepository();
    this.supplierRepository = new SupplierRepository();
    this.stockMovementRepository = new StockMovementRepository();
    this.auditLogRepository = new AuditLogRepository();
  }

  async createPurchaseOrder(data: CreatePurchaseOrderDto, createdBy: string): Promise<any> {
    const { supplier, lines, ...orderData } = data;

    // Verify supplier exists
    const supplierDoc = await this.supplierRepository.findById(supplier);
    if (!supplierDoc) {
      throw new NotFoundError('Supplier');
    }

    // Verify all products exist and are active
    for (const line of lines) {
      const product = await this.productRepository.findById(line.product);
      if (!product || !product.isActive || product.isDeleted) {
        throw new NotFoundError(`Product ${line.product}`);
      }
    }

    // Generate order number
    const orderNumber = await this.purchaseOrderRepository.model.generateOrderNumber();

    // Create purchase order
    const purchaseOrder = await this.purchaseOrderRepository.create({
      orderNumber,
      supplier: new Types.ObjectId(supplier),
      lines: lines.map(line => ({
        product: new Types.ObjectId(line.product),
        quantity: line.quantity,
        unitCost: line.unitCost,
        totalCost: line.quantity * line.unitCost,
      })),
      totalAmount: lines.reduce((total, line) => total + (line.quantity * line.unitCost), 0),
      status: 'draft',
      createdBy: new Types.ObjectId(createdBy),
      ...orderData,
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'PurchaseOrder',
      entityId: purchaseOrder._id.toString(),
      action: 'created',
      payloadAfter: purchaseOrder.toJSON(),
      performedBy: createdBy,
    });

    return purchaseOrder.toJSON();
  }

  async getPurchaseOrderById(id: string): Promise<any> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase Order');
    }
    return purchaseOrder.toJSON();
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderDto, updatedBy: string): Promise<any> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase Order');
    }

    // Can only update draft orders
    if (purchaseOrder.status !== 'draft') {
      throw new BadRequestError('Can only update draft purchase orders');
    }

    // Verify supplier if being changed
    if (data.supplier) {
      const supplier = await this.supplierRepository.findById(data.supplier);
      if (!supplier) {
        throw new NotFoundError('Supplier');
      }
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

    const updatedOrder = await this.purchaseOrderRepository.updateById(id, data);

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'PurchaseOrder',
      entityId: id,
      action: 'updated',
      payloadBefore: purchaseOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: updatedBy,
    });

    return updatedOrder!.toJSON();
  }

  async approvePurchaseOrder(id: string, data: ApprovePurchaseOrderDto, approvedBy: string): Promise<any> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase Order');
    }

    if (purchaseOrder.status !== 'draft') {
      throw new BadRequestError('Can only approve draft purchase orders');
    }

    const updatedOrder = await this.purchaseOrderRepository.updateById(id, {
      status: 'approved',
      notes: data.notes ? `${purchaseOrder.notes || ''}\nApproved: ${data.notes}`.trim() : purchaseOrder.notes,
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'PurchaseOrder',
      entityId: id,
      action: 'approved',
      payloadBefore: purchaseOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: approvedBy,
    });

    return updatedOrder!.toJSON();
  }

  async receivePurchaseOrder(id: string, data: ReceivePurchaseOrderDto, receivedBy: string): Promise<any> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase Order');
    }

    if (purchaseOrder.status !== 'approved') {
      throw new BadRequestError('Can only receive approved purchase orders');
    }

    // Update purchase order status
    const updatedOrder = await this.purchaseOrderRepository.updateById(id, {
      status: 'received',
      receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
      notes: data.notes ? `${purchaseOrder.notes || ''}\nReceived: ${data.notes}`.trim() : purchaseOrder.notes,
    });

    // Create stock movements for each line item
    for (const line of purchaseOrder.lines) {
      await this.stockMovementRepository.create({
        product: line.product,
        warehouse: new Types.ObjectId(), // You might want to specify a default warehouse
        type: 'in',
        quantity: line.quantity,
        reason: 'purchase',
        referenceDocument: {
          type: 'purchase_order',
          id: purchaseOrder._id,
        },
        notes: `Received from purchase order ${purchaseOrder.orderNumber}`,
        performedBy: new Types.ObjectId(receivedBy),
      });
    }

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'PurchaseOrder',
      entityId: id,
      action: 'received',
      payloadBefore: purchaseOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: receivedBy,
    });

    return updatedOrder!.toJSON();
  }

  async cancelPurchaseOrder(id: string, cancelledBy: string): Promise<any> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase Order');
    }

    if (purchaseOrder.status === 'received') {
      throw new BadRequestError('Cannot cancel received purchase orders');
    }

    const updatedOrder = await this.purchaseOrderRepository.updateById(id, {
      status: 'cancelled',
    });

    // Log the action
    await this.auditLogRepository.logAction({
      entity: 'PurchaseOrder',
      entityId: id,
      action: 'cancelled',
      payloadBefore: purchaseOrder.toJSON(),
      payloadAfter: updatedOrder!.toJSON(),
      performedBy: cancelledBy,
    });

    return updatedOrder!.toJSON();
  }

  async getPurchaseOrders(query: PurchaseOrderListQueryDto): Promise<any> {
    const { search, status, supplier, dateFrom, dateTo, ...pagination } = query;
    
    let filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (supplier) {
      filter.supplier = new Types.ObjectId(supplier);
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
      return this.purchaseOrderRepository.searchPurchaseOrders(search, pagination);
    }
    
    return this.purchaseOrderRepository.findPaginated(filter, pagination);
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(id);
    if (!purchaseOrder) {
      throw new NotFoundError('Purchase Order');
    }

    if (purchaseOrder.status === 'received') {
      throw new BadRequestError('Cannot delete received purchase orders');
    }

    await this.purchaseOrderRepository.deleteById(id);
  }
}
