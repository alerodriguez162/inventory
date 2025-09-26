import { Router } from 'express';
import { StockController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { stockAdjustmentSchema, stockTransferSchema, stockLevelQuerySchema, stockMovementListQuerySchema, idSchema } from '../dtos';

const router = Router();
const stockController = new StockController();

// All routes require authentication
router.use(authenticate);

// All authenticated users can get stock levels
router.get('/levels', 
  validateQuery(stockLevelQuerySchema),
  stockController.getStockLevels
);

// All authenticated users can get stock level for specific product and warehouse
router.get('/levels/:productId/:warehouseId', 
  stockController.getStockLevel
);

// All authenticated users can get stock levels by warehouse
router.get('/levels/warehouse/:warehouseId', 
  validateParams(idSchema),
  stockController.getStockLevelsByWarehouse
);

// All authenticated users can get stock levels by product
router.get('/levels/product/:productId', 
  validateParams(idSchema),
  stockController.getStockLevelsByProduct
);

// Admin and Manager can adjust stock
router.post('/adjust', 
  authorize('admin', 'manager'),
  validateBody(stockAdjustmentSchema),
  stockController.adjustStock
);

// Admin and Manager can transfer stock
router.post('/transfer', 
  authorize('admin', 'manager'),
  validateBody(stockTransferSchema),
  stockController.transferStock
);

// All authenticated users can get stock movements
router.get('/movements', 
  validateQuery(stockMovementListQuerySchema),
  stockController.getStockMovements
);

export default router;
