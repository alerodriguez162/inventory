import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { createUserSchema, updateUserSchema, userListQuerySchema, idSchema } from '../dtos';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// Admin and Manager can create users
router.post('/', 
  authorize('admin', 'manager'),
  validateBody(createUserSchema),
  userController.createUser
);

// All authenticated users can list users
router.get('/', 
  validateQuery(userListQuerySchema),
  userController.getUsers
);

// All authenticated users can get user by ID
router.get('/:id', 
  validateParams(idSchema),
  userController.getUserById
);

// Admin and Manager can update users
router.put('/:id', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  validateBody(updateUserSchema),
  userController.updateUser
);

// Admin can delete users
router.delete('/:id', 
  authorize('admin'),
  validateParams(idSchema),
  userController.deleteUser
);

// Admin and Manager can activate/deactivate users
router.patch('/:id/activate', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  userController.activateUser
);

router.patch('/:id/deactivate', 
  authorize('admin', 'manager'),
  validateParams(idSchema),
  userController.deactivateUser
);

export default router;
