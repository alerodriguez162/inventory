import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from '../services';
import { 
  createPurchaseOrderSchema, 
  updatePurchaseOrderSchema, 
  purchaseOrderListQuerySchema, 
  idSchema, 
  approvePurchaseOrderSchema, 
  receivePurchaseOrderSchema 
} from '../dtos';

export class PurchaseOrderController {
  private purchaseOrderService: PurchaseOrderService;

  constructor() {
    this.purchaseOrderService = new PurchaseOrderService();
  }

  createPurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createPurchaseOrderSchema.parse(req.body);
      const createdBy = req.user!._id;
      const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder(data, createdBy);
      
      res.status(201).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPurchaseOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = purchaseOrderListQuerySchema.parse(req.query);
      const result = await this.purchaseOrderService.getPurchaseOrders(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getPurchaseOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const purchaseOrder = await this.purchaseOrderService.getPurchaseOrderById(id);
      
      res.status(200).json({
        success: true,
        data: purchaseOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = updatePurchaseOrderSchema.parse(req.body);
      const updatedBy = req.user!._id;
      const purchaseOrder = await this.purchaseOrderService.updatePurchaseOrder(id, data, updatedBy);
      
      res.status(200).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  approvePurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = approvePurchaseOrderSchema.parse(req.body);
      const approvedBy = req.user!._id;
      const purchaseOrder = await this.purchaseOrderService.approvePurchaseOrder(id, data, approvedBy);
      
      res.status(200).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order approved successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  receivePurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = receivePurchaseOrderSchema.parse(req.body);
      const receivedBy = req.user!._id;
      const purchaseOrder = await this.purchaseOrderService.receivePurchaseOrder(id, data, receivedBy);
      
      res.status(200).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order received successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  cancelPurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const cancelledBy = req.user!._id;
      const purchaseOrder = await this.purchaseOrderService.cancelPurchaseOrder(id, cancelledBy);
      
      res.status(200).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deletePurchaseOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      await this.purchaseOrderService.deletePurchaseOrder(id);
      
      res.status(200).json({
        success: true,
        message: 'Purchase order deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
