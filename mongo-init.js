// MongoDB initialization script
db = db.getSiblingDB('inventory_manager');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'manager', 'viewer']
        }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sku', 'name', 'category', 'cost', 'price', 'unit'],
      properties: {
        sku: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 50
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        cost: {
          bsonType: 'number',
          minimum: 0
        },
        price: {
          bsonType: 'number',
          minimum: 0
        }
      }
    }
  }
});

db.createCollection('warehouses');
db.createCollection('suppliers');
db.createCollection('purchaseorders');
db.createCollection('salesorders');
db.createCollection('stockmovements');
db.createCollection('auditlogs');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ name: 'text', category: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ isActive: 1, isDeleted: 1 });

db.warehouses.createIndex({ name: 1 }, { unique: true });
db.warehouses.createIndex({ isActive: 1 });

db.suppliers.createIndex({ 'contact.email': 1 });
db.suppliers.createIndex({ status: 1 });

db.purchaseorders.createIndex({ orderNumber: 1 }, { unique: true });
db.purchaseorders.createIndex({ supplier: 1 });
db.purchaseorders.createIndex({ status: 1 });
db.purchaseorders.createIndex({ orderDate: -1 });

db.salesorders.createIndex({ orderNumber: 1 }, { unique: true });
db.salesorders.createIndex({ 'customer.name': 'text', 'customer.email': 'text' });
db.salesorders.createIndex({ status: 1 });
db.salesorders.createIndex({ orderDate: -1 });

db.stockmovements.createIndex({ product: 1, warehouse: 1 });
db.stockmovements.createIndex({ product: 1 });
db.stockmovements.createIndex({ warehouse: 1 });
db.stockmovements.createIndex({ type: 1 });
db.stockmovements.createIndex({ reason: 1 });
db.stockmovements.createIndex({ createdAt: -1 });

db.auditlogs.createIndex({ entity: 1, entityId: 1 });
db.auditlogs.createIndex({ performedBy: 1 });
db.auditlogs.createIndex({ createdAt: -1 });

print('Database initialized successfully');
