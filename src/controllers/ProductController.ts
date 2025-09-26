import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services';
import { createProductSchema, updateProductSchema, productListQuerySchema, idSchema, softDeleteProductSchema } from '../dtos';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = createProductSchema.parse(req.body);
      const product = await this.productService.createProduct(data);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = productListQuerySchema.parse(req.query);
      const result = await this.productService.getProducts(query);
      
      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const product = await this.productService.getProductById(id);
      
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductBySku = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sku } = req.params;
      const product = await this.productService.getProductBySku(sku);
      
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = updateProductSchema.parse(req.body);
      const product = await this.productService.updateProduct(id, data);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const data = softDeleteProductSchema.parse(req.body);
      await this.productService.deleteProduct(id, data.reason);
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  restoreProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = idSchema.parse(req.params);
      const product = await this.productService.restoreProduct(id);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Product restored successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productService.getActiveProducts();
      
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const products = await this.productService.getProductsByCategory(category);
      
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };
}
