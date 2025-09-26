import { Router } from 'express';
import { ProductController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { createProductSchema, updateProductSchema, productListQuerySchema, idSchema, softDeleteProductSchema } from '../dtos';

const router = Router();
const productController = new ProductController();

// All routes require authentication
router.use(authenticate);

// Admin and Manager can create products
router.post('/', 
  authorize('admin', 'manager'),
  validateBody(createProductSchema),
  productController.createProduct
);

// All authenticated users can list products
router.get('/', 
  validateQuery(productListQuerySchema),
  productController.getProducts
);

// All authenticated users can get product by ID
router.get('/:id', 
  validateParams(idSchema),
  productController.getProductById
);

// All authenticated users can get product by SKU
router.get('/sku/:sku', 
  productController.getProductBySku
);

// Admin and Manager can update products
router.put('/:id', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(updateProductSchema),
  productController.updateProduct
);

// Admin and Manager can delete products (soft delete)
router.delete('/:id', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(softDeleteProductSchema),
  productController.deleteProduct
);

// Admin and Manager can restore products
router.patch('/:id/restore', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  productController.restoreProduct
);

// All authenticated users can get active products
router.get('/active/list', 
  productController.getActiveProducts
);

// All authenticated users can get products by category
router.get('/category/:category', 
  productController.getProductsByCategory
);

export default router;
