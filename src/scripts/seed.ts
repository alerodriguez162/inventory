import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, Product, Warehouse, Supplier, PurchaseOrder, SalesOrder, StockMovement } from '../models';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

const seedData = async (): Promise<void> => {
  try {
    await connectDatabase();
    logger.info('Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Warehouse.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      SalesOrder.deleteMany({}),
      StockMovement.deleteMany({}),
    ]);

    logger.info('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });

    // Create manager user
    const managerUser = await User.create({
      email: 'manager@inventory.com',
      password: 'manager123',
      role: 'manager',
      isActive: true,
    });

    // Create viewer user
    const viewerUser = await User.create({
      email: 'viewer@inventory.com',
      password: 'viewer123',
      role: 'viewer',
      isActive: true,
    });

    logger.info('Created users');

    // Create warehouses
    const mainWarehouse = await Warehouse.create({
      name: 'Main Warehouse',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      isActive: true,
    });

    const secondaryWarehouse = await Warehouse.create({
      name: 'Secondary Warehouse',
      address: {
        street: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
      },
      isActive: true,
    });

    logger.info('Created warehouses');

    // Create suppliers
    const supplier1 = await Supplier.create({
      name: 'Tech Supplies Inc',
      contact: {
        name: 'John Smith',
        email: 'john@techsupplies.com',
        phone: '+1-555-0123',
      },
      address: {
        street: '789 Tech Drive',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      status: 'active',
    });

    const supplier2 = await Supplier.create({
      name: 'Office Depot',
      contact: {
        name: 'Jane Doe',
        email: 'jane@officedepot.com',
        phone: '+1-555-0456',
      },
      address: {
        street: '321 Business Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
      status: 'active',
    });

    logger.info('Created suppliers');

    // Create products
    const products = await Product.create([
      {
        sku: 'LAPTOP001',
        name: 'Dell Laptop XPS 13',
        category: 'Electronics',
        cost: 800,
        price: 1200,
        unit: 'piece',
        isActive: true,
        attributes: {
          brand: 'Dell',
          model: 'XPS 13',
          color: 'Silver',
          weight: '2.7 lbs',
        },
      },
      {
        sku: 'MOUSE001',
        name: 'Wireless Mouse',
        category: 'Accessories',
        cost: 15,
        price: 25,
        unit: 'piece',
        isActive: true,
        attributes: {
          brand: 'Logitech',
          connectivity: 'Wireless',
          color: 'Black',
        },
      },
      {
        sku: 'KEYBOARD001',
        name: 'Mechanical Keyboard',
        category: 'Accessories',
        cost: 80,
        price: 120,
        unit: 'piece',
        isActive: true,
        attributes: {
          brand: 'Corsair',
          type: 'Mechanical',
          switches: 'Cherry MX Red',
        },
      },
      {
        sku: 'MONITOR001',
        name: '4K Monitor 27"',
        category: 'Electronics',
        cost: 300,
        price: 450,
        unit: 'piece',
        isActive: true,
        attributes: {
          brand: 'Samsung',
          size: '27 inch',
          resolution: '4K',
          refreshRate: '60Hz',
        },
      },
      {
        sku: 'DESK001',
        name: 'Office Desk',
        category: 'Furniture',
        cost: 150,
        price: 250,
        unit: 'piece',
        isActive: true,
        attributes: {
          material: 'Wood',
          dimensions: '120x60x75 cm',
          color: 'Brown',
        },
      },
    ]);

    logger.info('Created products');

    // Create initial stock movements
    const stockMovements = await StockMovement.create([
      {
        product: products[0]._id,
        warehouse: mainWarehouse._id,
        type: 'in',
        quantity: 10,
        reason: 'adjustment',
        notes: 'Initial stock',
        performedBy: adminUser._id,
      },
      {
        product: products[1]._id,
        warehouse: mainWarehouse._id,
        type: 'in',
        quantity: 50,
        reason: 'adjustment',
        notes: 'Initial stock',
        performedBy: adminUser._id,
      },
      {
        product: products[2]._id,
        warehouse: mainWarehouse._id,
        type: 'in',
        quantity: 20,
        reason: 'adjustment',
        notes: 'Initial stock',
        performedBy: adminUser._id,
      },
      {
        product: products[3]._id,
        warehouse: mainWarehouse._id,
        type: 'in',
        quantity: 15,
        reason: 'adjustment',
        notes: 'Initial stock',
        performedBy: adminUser._id,
      },
      {
        product: products[4]._id,
        warehouse: mainWarehouse._id,
        type: 'in',
        quantity: 8,
        reason: 'adjustment',
        notes: 'Initial stock',
        performedBy: adminUser._id,
      },
    ]);

    logger.info('Created initial stock movements');

    // Create a sample purchase order
    const purchaseOrder = await PurchaseOrder.create({
      orderNumber: 'PO-202412-0001',
      supplier: supplier1._id,
      lines: [
        {
          product: products[0]._id,
          quantity: 5,
          unitCost: 800,
          totalCost: 4000,
        },
        {
          product: products[1]._id,
          quantity: 25,
          unitCost: 15,
          totalCost: 375,
        },
      ],
      totalAmount: 4375,
      status: 'approved',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: 'Sample purchase order for demonstration',
      createdBy: managerUser._id,
    });

    logger.info('Created sample purchase order');

    // Create a sample sales order
    const salesOrder = await SalesOrder.create({
      orderNumber: 'SO-202412-0001',
      customer: {
        name: 'ABC Company',
        email: 'orders@abccompany.com',
        phone: '+1-555-0789',
      },
      lines: [
        {
          product: products[0]._id,
          quantity: 2,
          unitPrice: 1200,
          totalPrice: 2400,
        },
        {
          product: products[1]._id,
          quantity: 5,
          unitPrice: 25,
          totalPrice: 125,
        },
      ],
      totalAmount: 2525,
      status: 'draft',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      notes: 'Sample sales order for demonstration',
      createdBy: managerUser._id,
    });

    logger.info('Created sample sales order');

    logger.info('Database seeding completed successfully!');
    logger.info('Created:');
    logger.info(`- 3 users (admin, manager, viewer)`);
    logger.info(`- 2 warehouses`);
    logger.info(`- 2 suppliers`);
    logger.info(`- 5 products`);
    logger.info(`- 5 stock movements`);
    logger.info(`- 1 purchase order`);
    logger.info(`- 1 sales order`);

    logger.info('\nDefault login credentials:');
    logger.info('Admin: admin@inventory.com / admin123');
    logger.info('Manager: manager@inventory.com / manager123');
    logger.info('Viewer: viewer@inventory.com / viewer123');

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedData;
