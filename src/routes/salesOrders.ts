import { Router } from 'express';
import { SalesOrderController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { 
  createSalesOrderSchema, 
  updateSalesOrderSchema, 
  salesOrderListQuerySchema, 
  idSchema, 
  confirmSalesOrderSchema, 
  fulfillSalesOrderSchema 
} from '../dtos';

const router = Router();
const salesOrderController = new SalesOrderController();

// All routes require authentication
router.use(authenticate);

// Admin and Manager can create sales orders
router.post('/', 
  authorize('admin', 'manager'),
  validateBody(createSalesOrderSchema),
  salesOrderController.createSalesOrder
);

// All authenticated users can list sales orders
router.get('/', 
  validateQuery(salesOrderListQuerySchema),
  salesOrderController.getSalesOrders
);

// All authenticated users can get sales order by ID
router.get('/:id', 
  validateParams(idSchema),
  salesOrderController.getSalesOrderById
);

// Admin and Manager can update sales orders
router.put('/:id', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(updateSalesOrderSchema),
  salesOrderController.updateSalesOrder
);

// Admin and Manager can confirm sales orders
router.patch('/:id/confirm', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(confirmSalesOrderSchema),
  salesOrderController.confirmSalesOrder
);

// Admin and Manager can fulfill sales orders
router.patch('/:id/fulfill', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(fulfillSalesOrderSchema),
  salesOrderController.fulfillSalesOrder
);

// Admin and Manager can cancel sales orders
router.patch('/:id/cancel', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  salesOrderController.cancelSalesOrder
);

// Admin can delete sales orders
router.delete('/:id', 
  authorize('admin'),
  validateParams(idSchema),
  salesOrderController.deleteSalesOrder
);

export default router;
