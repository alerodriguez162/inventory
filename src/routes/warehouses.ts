import { Router } from 'express';
import { WarehouseController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { createWarehouseSchema, updateWarehouseSchema, warehouseListQuerySchema, idSchema } from '../dtos';

const router = Router();
const warehouseController = new WarehouseController();

// All routes require authentication
router.use(authenticate);

// Admin and Manager can create warehouses
router.post('/', 
  authorize('admin', 'manager'),
  validateBody(createWarehouseSchema),
  warehouseController.createWarehouse
);

// All authenticated users can list warehouses
router.get('/', 
  validateQuery(warehouseListQuerySchema),
  warehouseController.getWarehouses
);

// All authenticated users can get warehouse by ID
router.get('/:id', 
  validateParams(idSchema),
  warehouseController.getWarehouseById
);

// Admin and Manager can update warehouses
router.put('/:id', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(updateWarehouseSchema),
  warehouseController.updateWarehouse
);

// Admin can delete warehouses
router.delete('/:id', 
  authorize('admin'),
  validateParams(idSchema),
  warehouseController.deleteWarehouse
);

// All authenticated users can get active warehouses
router.get('/active/list', 
  warehouseController.getActiveWarehouses
);

// All authenticated users can get warehouse by name
router.get('/name/:name', 
  warehouseController.getWarehouseByName
);

// All authenticated users can get warehouses by location
router.get('/location/:city/:state', 
  warehouseController.getWarehousesByLocation
);

export default router;
