# Inventory Management System

A comprehensive inventory management system built with Node.js, TypeScript, Express, and MongoDB. This system provides complete functionality for managing products, warehouses, suppliers, purchase orders, sales orders, and stock movements with role-based access control.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Admin, Manager, Viewer)
- **Product Management**: SKU-based product catalog with categories and attributes
- **Warehouse Management**: Multiple warehouse support with location tracking
- **Supplier Management**: Supplier information and contact management
- **Purchase Orders**: Complete purchase order lifecycle (draft → approved → received)
- **Sales Orders**: Complete sales order lifecycle (draft → confirmed → fulfilled)
- **Stock Management**: Real-time stock tracking with movements and transfers
- **Audit Logging**: Complete audit trail for all operations

### Technical Features
- **TypeScript**: Full type safety with strict configuration
- **MongoDB**: Document-based database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Structured logging with Pino
- **Rate Limiting**: API rate limiting for security
- **Security**: Helmet, CORS, and input sanitization
- **Testing**: Unit and integration tests with Jest
- **Docker**: Complete Docker containerization
- **API Documentation**: OpenAPI 3.0 documentation with Swagger UI

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Docker (optional)

## 🛠️ Installation

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   HOST=localhost
   MONGODB_URI=mongodb://localhost:27017/inventory_manager
   MONGODB_TEST_URI=mongodb://localhost:27017/inventory_manager_test
   JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   CACHE_TTL=300000
   API_DOCS_PATH=/api-docs
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using MongoDB Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

### Option 2: Docker Compose

1. **Clone and navigate to the repository**
   ```bash
   git clone <repository-url>
   cd inventory-manager
   ```

2. **Start all services**
   ```bash
   npm run docker:up
   ```

3. **Seed the database**
   ```bash
   npm run seed
   ```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test files
```bash
# Unit tests
npm test -- src/tests/unit

# Integration tests
npm test -- src/tests/integration
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs/json

## 🎯 Usage Examples

### 1. Authentication

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "viewer"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Product Management

```bash
# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sku": "PROD001",
    "name": "Sample Product",
    "category": "Electronics",
    "cost": 100,
    "price": 150,
    "unit": "piece"
  }'

# Get all products
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Stock Management

```bash
# Check stock level
curl -X GET "http://localhost:3000/api/stock/levels/PRODUCT_ID/WAREHOUSE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Adjust stock
curl -X POST http://localhost:3000/api/stock/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product": "PRODUCT_ID",
    "warehouse": "WAREHOUSE_ID",
    "quantity": 10,
    "notes": "Initial stock"
  }'
```

### 4. Purchase Orders

```bash
# Create purchase order
curl -X POST http://localhost:3000/api/purchase-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplier": "SUPPLIER_ID",
    "lines": [
      {
        "product": "PRODUCT_ID",
        "quantity": 10,
        "unitCost": 50
      }
    ]
  }'

# Approve purchase order
curl -X PATCH http://localhost:3000/api/purchase-orders/ORDER_ID/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"notes": "Approved"}'
```

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # MongoDB connection
│   └── env.ts        # Environment variables
├── controllers/      # Request handlers
├── dtos/            # Data transfer objects and validation schemas
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── repositories/    # Data access layer
├── routes/          # Express routes
├── services/        # Business logic layer
├── scripts/         # Utility scripts
│   ├── seed.ts      # Database seeding
│   └── demo.ts      # Demo workflow
├── tests/           # Test files
│   ├── unit/        # Unit tests
│   └── integration/ # Integration tests
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── docs/            # API documentation
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run seed` - Seed the database with sample data
- `npm run demo` - Run demo workflow
- `npm run docker:up` - Start services with Docker Compose
- `npm run docker:down` - Stop Docker Compose services

## 🔐 Default Credentials

After running the seed script, you can use these default accounts:

- **Admin**: admin@inventory.com / admin123
- **Manager**: manager@inventory.com / manager123  
- **Viewer**: viewer@inventory.com / viewer123

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t inventory-manager .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name inventory-app \
     -p 3000:3000 \
     -e MONGODB_URI=mongodb://host:port/database \
     -e JWT_SECRET=your-secret \
     inventory-manager
   ```

### Docker Compose Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Demo Workflow

Run the demo script to see the complete workflow:

```bash
npm run demo
```

This will:
1. Create a new product and warehouse
2. Create and process a purchase order
3. Create and process a sales order
4. Perform stock transfers
5. Track stock levels throughout

## 📊 Database Schema

### Collections
- **users**: User accounts with roles
- **products**: Product catalog with SKUs
- **warehouses**: Warehouse locations
- **suppliers**: Supplier information
- **purchaseorders**: Purchase order management
- **salesorders**: Sales order management
- **stockmovements**: Stock movement tracking
- **auditlogs**: Audit trail

### Key Features
- **Soft Deletes**: Products use logical deletion
- **Optimistic Concurrency**: Stock movements use versioning
- **Indexes**: Optimized for common queries
- **Validation**: Schema validation at database level

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Granular permissions
- **Rate Limiting**: API protection
- **Input Validation**: Zod schema validation
- **Input Sanitization**: XSS protection
- **CORS**: Cross-origin request handling
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with salt rounds

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Errors**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Ensure proper Authorization header

3. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Check data types

4. **Permission Denied**
   - Verify user role
   - Check endpoint permissions
   - Ensure user is authenticated

### Debug Mode

Set `LOG_LEVEL=debug` in your `.env` file for detailed logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the test files for usage examples

---

**Built with ❤️ using Node.js, TypeScript, Express, and MongoDB**
