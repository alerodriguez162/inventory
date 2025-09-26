import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from '../services';
import { createWarehouseSchema, updateWarehouseSchema, warehouseListQuerySchema, idSchema } from '../dtos';

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor() {
    this.warehouseService = new WarehouseService();
  }

  createWarehouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createWarehouseSchema.parse(req.body);
      const warehouse = await this.warehouseService.createWarehouse(data);
      
      res.status(201).json({
        success: true,
        data: warehouse,
        message: 'Warehouse created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getWarehouses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = warehouseListQuerySchema.parse(req.query);
      const result = await this.warehouseService.getWarehouses(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getWarehouseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const warehouse = await this.warehouseService.getWarehouseById(id);
      
      res.status(200).json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  };

  updateWarehouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = updateWarehouseSchema.parse(req.body);
      const warehouse = await this.warehouseService.updateWarehouse(id, data);
      
      res.status(200).json({
        success: true,
        data: warehouse,
        message: 'Warehouse updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteWarehouse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      await this.warehouseService.deleteWarehouse(id);
      
      res.status(200).json({
        success: true,
        message: 'Warehouse deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveWarehouses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const warehouses = await this.warehouseService.getActiveWarehouses();
      
      res.status(200).json({
        success: true,
        data: warehouses,
      });
    } catch (error) {
      next(error);
    }
  };

  getWarehouseByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const warehouse = await this.warehouseService.getWarehouseByName(name);
      
      res.status(200).json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  };

  getWarehousesByLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { city, state } = req.params;
      const warehouses = await this.warehouseService.getWarehousesByLocation(city, state);
      
      res.status(200).json({
        success: true,
        data: warehouses,
      });
    } catch (error) {
      next(error);
    }
  };
}
