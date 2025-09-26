import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inventory Management API',
      version: '1.0.0',
      description: 'A comprehensive inventory management system built with Node.js, TypeScript, Express, and MongoDB',
      contact: {
        name: 'API Support',
        email: 'support@inventory.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            role: { type: 'string', enum: ['admin', 'manager', 'viewer'], example: 'viewer' },
            isActive: { type: 'boolean', example: true },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            sku: { type: 'string', example: 'PROD001' },
            name: { type: 'string', example: 'Sample Product' },
            category: { type: 'string', example: 'Electronics' },
            cost: { type: 'number', example: 100 },
            price: { type: 'number', example: 150 },
            unit: { type: 'string', example: 'piece' },
            isActive: { type: 'boolean', example: true },
            attributes: { type: 'object' },
            isDeleted: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Warehouse: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Main Warehouse' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' },
              },
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Supplier: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'ABC Supplies' },
            contact: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john@abc.com' },
                phone: { type: 'string', example: '+1-555-0123' },
              },
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '456 Business Ave' },
                city: { type: 'string', example: 'Chicago' },
                state: { type: 'string', example: 'IL' },
                zipCode: { type: 'string', example: '60601' },
                country: { type: 'string', example: 'USA' },
              },
            },
            status: { type: 'string', enum: ['active', 'inactive', 'suspended'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PurchaseOrder: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            orderNumber: { type: 'string', example: 'PO-202412-0001' },
            supplier: { type: 'string', example: '507f1f77bcf86cd799439011' },
            lines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  quantity: { type: 'number', example: 10 },
                  unitCost: { type: 'number', example: 50 },
                  totalCost: { type: 'number', example: 500 },
                },
              },
            },
            totalAmount: { type: 'number', example: 500 },
            status: { type: 'string', enum: ['draft', 'approved', 'received', 'cancelled'], example: 'draft' },
            orderDate: { type: 'string', format: 'date-time' },
            expectedDeliveryDate: { type: 'string', format: 'date-time' },
            receivedDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string', example: 'Urgent order' },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SalesOrder: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            orderNumber: { type: 'string', example: 'SO-202412-0001' },
            customer: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Customer Name' },
                email: { type: 'string', format: 'email', example: 'customer@example.com' },
                phone: { type: 'string', example: '+1-555-0123' },
              },
            },
            lines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  quantity: { type: 'number', example: 5 },
                  unitPrice: { type: 'number', example: 100 },
                  totalPrice: { type: 'number', example: 500 },
                },
              },
            },
            totalAmount: { type: 'number', example: 500 },
            status: { type: 'string', enum: ['draft', 'confirmed', 'fulfilled', 'cancelled'], example: 'draft' },
            orderDate: { type: 'string', format: 'date-time' },
            expectedDeliveryDate: { type: 'string', format: 'date-time' },
            fulfilledDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string', example: 'Customer notes' },
            createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        StockMovement: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            product: { type: 'string', example: '507f1f77bcf86cd799439011' },
            warehouse: { type: 'string', example: '507f1f77bcf86cd799439011' },
            type: { type: 'string', enum: ['in', 'out'], example: 'in' },
            quantity: { type: 'number', example: 10 },
            reason: { type: 'string', enum: ['purchase', 'sale', 'adjustment', 'transfer'], example: 'purchase' },
            referenceDocument: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['purchase_order', 'sales_order', 'adjustment', 'transfer'] },
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              },
            },
            notes: { type: 'string', example: 'Stock adjustment' },
            performedBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' },
            details: { type: 'array', items: { type: 'string' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
