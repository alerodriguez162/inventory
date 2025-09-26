import { Router } from 'express';
import { PurchaseOrderController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { 
  createPurchaseOrderSchema, 
  updatePurchaseOrderSchema, 
  purchaseOrderListQuerySchema, 
  idSchema, 
  approvePurchaseOrderSchema, 
  receivePurchaseOrderSchema 
} from '../dtos';

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

// All routes require authentication
router.use(authenticate);

// Admin and Manager can create purchase orders
router.post('/', 
  authorize('admin', 'manager'),
  validateBody(createPurchaseOrderSchema),
  purchaseOrderController.createPurchaseOrder
);

// All authenticated users can list purchase orders
router.get('/', 
  validateQuery(purchaseOrderListQuerySchema),
  purchaseOrderController.getPurchaseOrders
);

// All authenticated users can get purchase order by ID
router.get('/:id', 
  validateParams(idSchema),
  purchaseOrderController.getPurchaseOrderById
);

// Admin and Manager can update purchase orders
router.put('/:id', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(updatePurchaseOrderSchema),
  purchaseOrderController.updatePurchaseOrder
);

// Admin and Manager can approve purchase orders
router.patch('/:id/approve', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(approvePurchaseOrderSchema),
  purchaseOrderController.approvePurchaseOrder
);

// Admin and Manager can receive purchase orders
router.patch('/:id/receive', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(receivePurchaseOrderSchema),
  purchaseOrderController.receivePurchaseOrder
);

// Admin and Manager can cancel purchase orders
router.patch('/:id/cancel', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  purchaseOrderController.cancelPurchaseOrder
);

// Admin can delete purchase orders
router.delete('/:id', 
  authorize('admin'),
  validateParams(idSchema),
  purchaseOrderController.deletePurchaseOrder
);

export default router;
