import { connectDatabase, disconnectDatabase } from '../config/database';
import { AuthService, ProductService, WarehouseService, PurchaseOrderService, SalesOrderService, StockService } from '../services';
import { logger } from '../utils/logger';

const runDemo = async (): Promise<void> => {
  try {
    await connectDatabase();
    logger.info('Starting demo sequence...');

    const authService = new AuthService();
    const productService = new ProductService();
    const warehouseService = new WarehouseService();
    const purchaseOrderService = new PurchaseOrderService();
    const salesOrderService = new SalesOrderService();
    const stockService = new StockService();

    // Step 1: Login as admin
    logger.info('Step 1: Logging in as admin...');
    const loginResult = await authService.login({
      email: 'admin@inventory.com',
      password: 'admin123',
    });
    logger.info('Login successful');

    // Step 2: Create a new product
    logger.info('Step 2: Creating a new product...');
    const newProduct = await productService.createProduct({
      sku: 'DEMO001',
      name: 'Demo Product',
      category: 'Demo',
      cost: 50,
      price: 75,
      unit: 'piece',
      isActive: true,
    });
    logger.info(`Product created: ${newProduct.name} (SKU: ${newProduct.sku})`);

    // Step 3: Create a new warehouse
    logger.info('Step 3: Creating a new warehouse...');
    const newWarehouse = await warehouseService.createWarehouse({
      name: 'Demo Warehouse',
      address: {
        street: '999 Demo Street',
        city: 'Demo City',
        state: 'DC',
        zipCode: '12345',
        country: 'USA',
      },
      isActive: true,
    });
    logger.info(`Warehouse created: ${newWarehouse.name}`);

    // Step 4: Create a purchase order
    logger.info('Step 4: Creating a purchase order...');
    const purchaseOrder = await purchaseOrderService.createPurchaseOrder({
      supplier: '675a1b2c3d4e5f6789012345', // You'll need to get a real supplier ID
      lines: [
        {
          product: newProduct._id,
          quantity: 10,
          unitCost: 50,
        },
      ],
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Demo purchase order',
    }, loginResult.user._id);
    logger.info(`Purchase order created: ${purchaseOrder.orderNumber}`);

    // Step 5: Approve the purchase order
    logger.info('Step 5: Approving purchase order...');
    const approvedOrder = await purchaseOrderService.approvePurchaseOrder(
      purchaseOrder._id,
      { notes: 'Approved for demo' },
      loginResult.user._id
    );
    logger.info(`Purchase order approved: ${approvedOrder.status}`);

    // Step 6: Receive the purchase order
    logger.info('Step 6: Receiving purchase order...');
    const receivedOrder = await purchaseOrderService.receivePurchaseOrder(
      approvedOrder._id,
      { notes: 'Received for demo' },
      loginResult.user._id
    );
    logger.info(`Purchase order received: ${receivedOrder.status}`);

    // Step 7: Check stock level
    logger.info('Step 7: Checking stock level...');
    const stockLevel = await stockService.getStockLevel(newProduct._id, newWarehouse._id);
    logger.info(`Stock level for ${newProduct.name}: ${stockLevel} units`);

    // Step 8: Create a sales order
    logger.info('Step 8: Creating a sales order...');
    const salesOrder = await salesOrderService.createSalesOrder({
      customer: {
        name: 'Demo Customer',
        email: 'customer@demo.com',
        phone: '+1-555-0000',
      },
      lines: [
        {
          product: newProduct._id,
          quantity: 3,
          unitPrice: 75,
        },
      ],
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Demo sales order',
    }, loginResult.user._id);
    logger.info(`Sales order created: ${salesOrder.orderNumber}`);

    // Step 9: Confirm the sales order
    logger.info('Step 9: Confirming sales order...');
    const confirmedOrder = await salesOrderService.confirmSalesOrder(
      salesOrder._id,
      { notes: 'Confirmed for demo' },
      loginResult.user._id
    );
    logger.info(`Sales order confirmed: ${confirmedOrder.status}`);

    // Step 10: Fulfill the sales order
    logger.info('Step 10: Fulfilling sales order...');
    const fulfilledOrder = await salesOrderService.fulfillSalesOrder(
      confirmedOrder._id,
      { notes: 'Fulfilled for demo' },
      loginResult.user._id
    );
    logger.info(`Sales order fulfilled: ${fulfilledOrder.status}`);

    // Step 11: Check final stock level
    logger.info('Step 11: Checking final stock level...');
    const finalStockLevel = await stockService.getStockLevel(newProduct._id, newWarehouse._id);
    logger.info(`Final stock level for ${newProduct.name}: ${finalStockLevel} units`);

    // Step 12: Transfer stock between warehouses
    logger.info('Step 12: Transferring stock between warehouses...');
    // First, let's get the main warehouse ID
    const warehouses = await warehouseService.getActiveWarehouses();
    const mainWarehouse = warehouses.find(w => w.name === 'Main Warehouse');
    
    if (mainWarehouse) {
      const transferResult = await stockService.transferStock({
        product: newProduct._id,
        fromWarehouse: newWarehouse._id,
        toWarehouse: mainWarehouse._id,
        quantity: 2,
        notes: 'Demo transfer',
      }, loginResult.user._id);
      logger.info('Stock transferred successfully');
    }

    logger.info('\n🎉 Demo completed successfully!');
    logger.info('Summary of actions:');
    logger.info('✅ Created product, warehouse, purchase order, and sales order');
    logger.info('✅ Processed purchase order (approve → receive)');
    logger.info('✅ Processed sales order (confirm → fulfill)');
    logger.info('✅ Performed stock transfer');
    logger.info('✅ Tracked stock levels throughout the process');

  } catch (error) {
    logger.error('Demo failed:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
};

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo()
    .then(() => {
      logger.info('Demo completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Demo failed:', error);
      process.exit(1);
    });
}

export default runDemo;
