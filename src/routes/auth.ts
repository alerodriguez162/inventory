import { Router } from 'express';
import { AuthController } from '../controllers';
import { authenticate, authLimiter } from '../middleware';
import { validateBody } from '../middleware/validation';
import { loginSchema, registerSchema, refreshTokenSchema, changePasswordSchema } from '../dtos';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', 
  authLimiter,
  validateBody(registerSchema),
  authController.register
);

router.post('/login', 
  authLimiter,
  validateBody(loginSchema),
  authController.login
);

router.post('/refresh-token', 
  authLimiter,
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

// Protected routes
router.post('/logout', 
  authenticate,
  authController.logout
);

router.post('/change-password', 
  authenticate,
  validateBody(changePasswordSchema),
  authController.changePassword
);

export default router;
