import { Request, Response, NextFunction } from 'express';
import { SalesOrderService } from '../services';
import { 
  createSalesOrderSchema, 
  updateSalesOrderSchema, 
  salesOrderListQuerySchema, 
  idSchema, 
  confirmSalesOrderSchema, 
  fulfillSalesOrderSchema 
} from '../dtos';

export class SalesOrderController {
  private salesOrderService: SalesOrderService;

  constructor() {
    this.salesOrderService = new SalesOrderService();
  }

  createSalesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createSalesOrderSchema.parse(req.body);
      const createdBy = req.user!._id;
      const salesOrder = await this.salesOrderService.createSalesOrder(data, createdBy);
      
      res.status(201).json({
        success: true,
        data: salesOrder,
        message: 'Sales order created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getSalesOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = salesOrderListQuerySchema.parse(req.query);
      const result = await this.salesOrderService.getSalesOrders(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getSalesOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const salesOrder = await this.salesOrderService.getSalesOrderById(id);
      
      res.status(200).json({
        success: true,
        data: salesOrder,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSalesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = updateSalesOrderSchema.parse(req.body);
      const updatedBy = req.user!._id;
      const salesOrder = await this.salesOrderService.updateSalesOrder(id, data, updatedBy);
      
      res.status(200).json({
        success: true,
        data: salesOrder,
        message: 'Sales order updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  confirmSalesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = confirmSalesOrderSchema.parse(req.body);
      const confirmedBy = req.user!._id;
      const salesOrder = await this.salesOrderService.confirmSalesOrder(id, data, confirmedBy);
      
      res.status(200).json({
        success: true,
        data: salesOrder,
        message: 'Sales order confirmed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  fulfillSalesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = fulfillSalesOrderSchema.parse(req.body);
      const fulfilledBy = req.user!._id;
      const salesOrder = await this.salesOrderService.fulfillSalesOrder(id, data, fulfilledBy);
      
      res.status(200).json({
        success: true,
        data: salesOrder,
        message: 'Sales order fulfilled successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  cancelSalesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const cancelledBy = req.user!._id;
      const salesOrder = await this.salesOrderService.cancelSalesOrder(id, cancelledBy);
      
      res.status(200).json({
        success: true,
        data: salesOrder,
        message: 'Sales order cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSalesOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      await this.salesOrderService.deleteSalesOrder(id);
      
      res.status(200).json({
        success: true,
        message: 'Sales order deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
