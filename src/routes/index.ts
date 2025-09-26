import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import productRoutes from './products';
import warehouseRoutes from './warehouses';
import supplierRoutes from './suppliers';
import stockRoutes from './stock';
import purchaseOrderRoutes from './purchaseOrders';
import salesOrderRoutes from './salesOrders';
import docsRoutes from './docs';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/stock', stockRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/api-docs', docsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Inventory Management API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
