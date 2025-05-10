# Furniture Catalog API

This is the backend API for the Furniture Catalog system, providing endpoints for managing products, categories, orders, inquiries, and more.

## Authentication System

The system uses a unified authentication system for all user types:

### Authentication Endpoints

- **POST /api/auth/register** - Register a new customer account
- **POST /api/auth/login** - Login for all user types (customers, Product Managers, Super Admins)
- **GET /api/auth/profile** - Get the profile of the currently authenticated user

### User Types

The system supports the following user types:

1. **Customer** - Regular users who can browse products, place orders, and submit inquiries
2. **Product Manager** - Admin users who can manage products and categories
3. **Sales Admin** - Admin users who can manage orders, invoices, and customer information
4. **Super Admin** - Admin users with full access to all system features

### Role-Based Access Control

Access to different parts of the system is controlled by the user's role:

- **Super Admin** - Has access to all features through `/api/superadmin/*` endpoints
- **Product Manager** - Has access to product and category management through `/api/manager/*` endpoints
- **Sales Admin** - Has access to order, invoice, and customer management through `/api/sales/*` endpoints
- **Customer** - Has access to public endpoints and their own data

## API Endpoints

### Public Endpoints

- **GET /api/superadmin/products** - Get all products
- **GET /api/superadmin/products/:id** - Get a specific product
- **GET /api/superadmin/categories** - Get all categories
- **GET /api/superadmin/categories/tree** - Get category hierarchy
- **GET /api/superadmin/categories/:id** - Get a specific category
- **GET /api/superadmin/settings** - Get all settings
- **GET /api/superadmin/settings/:key** - Get a specific setting
- **GET /api/superadmin/settings/footer** - Get footer settings

### Authentication Endpoints

- **POST /api/auth/register** - Register a new account
- **POST /api/auth/login** - Login
- **GET /api/auth/profile** - Get profile
- **PUT /api/auth/profile** - Update profile

### Product Manager Endpoints

- **GET /api/manager/products** - Get all products
- **POST /api/manager/products** - Create a new product
- **PUT /api/manager/products/:id** - Update a product
- **DELETE /api/manager/products/:id** - Delete a product
- **POST /api/manager/products/:id/restore** - Restore a deleted product
- **PUT /api/manager/products/:id/images** - Update product images
- **GET /api/manager/categories** - Get all categories
- **GET /api/manager/categories/tree** - Get category hierarchy
- **GET /api/manager/categories/:id** - Get a specific category
- **POST /api/manager/categories** - Create a new category
- **PUT /api/manager/categories/:id** - Update a category
- **DELETE /api/manager/categories/:id** - Delete a category
- **PUT /api/manager/categories/:id/filters** - Update category filters
- **GET /api/manager/reviews** - Get all reviews
- **PUT /api/manager/reviews/:id** - Update review approval status

### Sales Admin Endpoints

- **GET /api/sales/orders** - Get all orders
- **GET /api/sales/orders/summary** - Get order summary statistics
- **GET /api/sales/orders/:id** - Get order details
- **PUT /api/sales/orders/:id/status** - Update order status
- **PUT /api/sales/orders/:id/payment** - Update payment status
- **POST /api/sales/orders/:id/invoice** - Generate invoice for an order
- **GET /api/sales/orders/customer/:userId** - Get customer order history
- **GET /api/sales/invoices** - Get all invoices
- **GET /api/sales/invoices/summary** - Get invoice summary statistics
- **GET /api/sales/invoices/:id** - Get invoice details
- **PUT /api/sales/invoices/:id/status** - Update invoice status
- **POST /api/sales/invoices/:id/send** - Send invoice by email
- **GET /api/sales/customers** - Get all customers
- **GET /api/sales/customers/top** - Get top customers
- **GET /api/sales/customers/:id** - Get customer details

### Super Admin Endpoints

- **GET /api/superadmin/admins** - Get all admins
- **POST /api/superadmin/admins** - Create a new admin
- **PUT /api/superadmin/admins/:id** - Update an admin
- **DELETE /api/superadmin/admins/:id** - Delete an admin
- **GET /api/superadmin/products** - Get all products
- **POST /api/superadmin/products** - Create a new product
- **PUT /api/superadmin/products/:id** - Update a product
- **DELETE /api/superadmin/products/:id** - Delete a product
- **POST /api/superadmin/products/:id/restore** - Restore a deleted product
- **PUT /api/superadmin/products/:id/images** - Update product images
- **GET /api/superadmin/categories** - Get all categories
- **GET /api/superadmin/categories/tree** - Get category hierarchy
- **GET /api/superadmin/categories/:id** - Get a specific category
- **POST /api/superadmin/categories** - Create a new category
- **PUT /api/superadmin/categories/:id** - Update a category
- **DELETE /api/superadmin/categories/:id** - Delete a category
- **PUT /api/superadmin/categories/:id/filters** - Update category filters
- **GET /api/superadmin/orders** - Get all orders
- **PUT /api/superadmin/orders/:id/status** - Update order status
- **GET /api/superadmin/inquiries** - Get all inquiries
- **PUT /api/superadmin/inquiries/:id** - Update inquiry status
- **GET /api/superadmin/settings** - Get all settings
- **GET /api/superadmin/settings/:key** - Get a specific setting
- **GET /api/superadmin/settings/footer** - Get footer settings
- **POST /api/superadmin/settings** - Create a new setting
- **PUT /api/superadmin/settings/:key** - Update a setting
- **DELETE /api/superadmin/settings/:key** - Delete a setting
- **POST /api/superadmin/settings/bulk-update** - Bulk update settings
- **GET /api/superadmin/analytics/dashboard** - Get dashboard statistics
- **GET /api/superadmin/analytics/sales** - Get sales analytics
- **GET /api/superadmin/analytics/products** - Get product analytics
- **GET /api/superadmin/analytics/users** - Get user analytics

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create the database:
```bash
npm run db:create
```

3. Run migrations to create tables:
```bash
npm run db:migrate
```

4. Seed the database with demo data:
```bash
npm run db:seed
```

5. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```
