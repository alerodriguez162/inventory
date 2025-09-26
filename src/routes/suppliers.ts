import { Router } from 'express';
import { SupplierController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { createSupplierSchema, updateSupplierSchema, supplierListQuerySchema, idSchema } from '../dtos';

const router = Router();
const supplierController = new SupplierController();

// All routes require authentication
router.use(authenticate);

// Admin and Manager can create suppliers
router.post('/', 
  authorize('admin', 'manager'),
  validateBody(createSupplierSchema),
  supplierController.createSupplier
);

// All authenticated users can list suppliers
router.get('/', 
  validateQuery(supplierListQuerySchema),
  supplierController.getSuppliers
);

// All authenticated users can get supplier by ID
router.get('/:id', 
  validateParams(idSchema),
  supplierController.getSupplierById
);

// Admin and Manager can update suppliers
router.put('/:id', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(updateSupplierSchema),
  supplierController.updateSupplier
);

// Admin can delete suppliers
router.delete('/:id', 
  authorize('admin'),
  validateParams(idSchema),
  supplierController.deleteSupplier
);

// All authenticated users can get active suppliers
router.get('/active/list', 
  supplierController.getActiveSuppliers
);

// All authenticated users can get supplier by email
router.get('/email/:email', 
  supplierController.getSupplierByEmail
);

// All authenticated users can get suppliers by status
router.get('/status/:status', 
  supplierController.getSuppliersByStatus
);

export default router;
