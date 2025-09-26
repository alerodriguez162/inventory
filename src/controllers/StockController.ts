import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services';
import { stockAdjustmentSchema, stockTransferSchema, stockLevelQuerySchema, stockMovementListQuerySchema, idSchema } from '../dtos';

export class StockController {
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService();
  }

  getStockLevel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, warehouseId } = req.params;
      const level = await this.stockService.getStockLevel(productId, warehouseId);
      
      res.status(200).json({
        success: true,
        data: {
          product: productId,
          warehouse: warehouseId,
          quantity: level,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getStockLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = stockLevelQuerySchema.parse(req.query);
      const levels = await this.stockService.getAllStockLevels(query);
      
      res.status(200).json({
        success: true,
        data: levels,
      });
    } catch (error) {
      next(error);
    }
  };

  getStockLevelsByWarehouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { warehouseId } = req.params;
      const levels = await this.stockService.getStockLevelsByWarehouse(warehouseId);
      
      res.status(200).json({
        success: true,
        data: levels,
      });
    } catch (error) {
      next(error);
    }
  };

  getStockLevelsByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const levels = await this.stockService.getStockLevelsByProduct(productId);
      
      res.status(200).json({
        success: true,
        data: levels,
      });
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = stockAdjustmentSchema.parse(req.body);
      const performedBy = req.user!._id;
      const movement = await this.stockService.adjustStock(data, performedBy);
      
      res.status(201).json({
        success: true,
        data: movement,
        message: 'Stock adjusted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  transferStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = stockTransferSchema.parse(req.body);
      const performedBy = req.user!._id;
      const result = await this.stockService.transferStock(data, performedBy);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Stock transferred successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getStockMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = stockMovementListQuerySchema.parse(req.query);
      const result = await this.stockService.getStockMovements(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };
}
