import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services';
import { createSupplierSchema, updateSupplierSchema, supplierListQuerySchema, idSchema } from '../dtos';

export class SupplierController {
  private supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createSupplierSchema.parse(req.body);
      const supplier = await this.supplierService.createSupplier(data);
      
      res.status(201).json({
        success: true,
        data: supplier,
        message: 'Supplier created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = supplierListQuerySchema.parse(req.query);
      const result = await this.supplierService.getSuppliers(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getSupplierById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const supplier = await this.supplierService.getSupplierById(id);
      
      res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = updateSupplierSchema.parse(req.body);
      const supplier = await this.supplierService.updateSupplier(id, data);
      
      res.status(200).json({
        success: true,
        data: supplier,
        message: 'Supplier updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      await this.supplierService.deleteSupplier(id);
      
      res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const suppliers = await this.supplierService.getActiveSuppliers();
      
      res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      next(error);
    }
  };

  getSupplierByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params;
      const supplier = await this.supplierService.getSupplierByEmail(email);
      
      res.status(200).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  getSuppliersByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.params;
      const suppliers = await this.supplierService.getSuppliersByStatus(status);
      
      res.status(200).json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      next(error);
    }
  };
}
