'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add admin roles
    await queryInterface.bulkInsert('AdminRoles', [
      {
        roleName: 'Super Admin',
        permissions: JSON.stringify({
          users: ['create', 'read', 'update', 'delete'],
          products: ['create', 'read', 'update', 'delete'],
          categories: ['create', 'read', 'update', 'delete'],
          orders: ['create', 'read', 'update', 'delete'],
          inquiries: ['read', 'update', 'delete'],
          reviews: ['read', 'update', 'delete'],
          invoices: ['create', 'read', 'update', 'delete'],
          reports: ['read'],
          settings: ['read', 'update']
        }),
        description: 'Full access to all system features',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: 'Product Manager',
        permissions: JSON.stringify({
          users: ['read'],
          products: ['create', 'read', 'update', 'delete'],
          categories: ['create', 'read', 'update', 'delete'],
          orders: ['read'],
          inquiries: ['read', 'update'],
          reviews: ['read', 'update'],
          invoices: ['read'],
          reports: ['read'],
          settings: ['read']
        }),
        description: 'Manages products and categories',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: 'Sales Admin',
        permissions: JSON.stringify({
          users: ['read'],
          products: ['read'],
          categories: ['read'],
          orders: ['create', 'read', 'update'],
          inquiries: ['read', 'update'],
          reviews: ['read'],
          invoices: ['create', 'read', 'update'],
          reports: ['read'],
          settings: ['read']
        }),
        description: 'Manages orders and customer inquiries',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Add demo users
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: '$2a$10$JvHX33r4DpbwPQQO8K5zAOGGuL1vUQw869bO6bPww2Y.d.rbI.Kga', // 'password123'
        roleId: 1, // Super Admin
        isActive: true,
        phone: '123-456-7890',
        address: '123 Admin St, Admin City, AC 12345',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Product Manager',
        email: 'product@example.com',
        password: '$2a$10$JvHX33r4DpbwPQQO8K5zAOGGuL1vUQw869bO6bPww2Y.d.rbI.Kga', // 'password123'
        roleId: 2, // Product Manager
        isActive: true,
        phone: '123-456-7891',
        address: '456 Product St, Product City, PC 12345',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sales Admin',
        email: 'sales@example.com',
        password: '$2a$10$JvHX33r4DpbwPQQO8K5zAOGGuL1vUQw869bO6bPww2Y.d.rbI.Kga', // 'password123'
        roleId: 3, // Sales Admin
        isActive: true,
        phone: '123-456-7892',
        address: '789 Sales St, Sales City, SC 12345',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: '$2a$10$JvHX33r4DpbwPQQO8K5zAOGGuL1vUQw869bO6bPww2Y.d.rbI.Kga', // 'password123'
        roleId: null, // Regular user
        isActive: true,
        phone: '123-456-7893',
        address: '101 User St, User City, UC 12345',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Add categories
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Living Room',
        description: 'Furniture for your living room',
        parentId: null,
        filters: JSON.stringify({
          material: ['Wood', 'Leather', 'Fabric', 'Metal', 'Glass'],
          color: ['Black', 'White', 'Brown', 'Gray', 'Beige'],
          priceRange: {
            min: 100,
            max: 5000
          }
        }),
        isActive: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bedroom',
        description: 'Furniture for your bedroom',
        parentId: null,
        filters: JSON.stringify({
          material: ['Wood', 'Metal', 'Fabric'],
          color: ['Black', 'White', 'Brown', 'Gray', 'Beige'],
          priceRange: {
            min: 200,
            max: 3000
          }
        }),
        isActive: true,
        displayOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dining Room',
        description: 'Furniture for your dining room',
        parentId: null,
        filters: JSON.stringify({
          material: ['Wood', 'Metal', 'Glass'],
          color: ['Black', 'White', 'Brown', 'Gray'],
          priceRange: {
            min: 150,
            max: 4000
          }
        }),
        isActive: true,
        displayOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Office',
        description: 'Furniture for your home office',
        parentId: null,
        filters: JSON.stringify({
          material: ['Wood', 'Metal', 'Glass', 'Plastic'],
          color: ['Black', 'White', 'Brown', 'Gray'],
          priceRange: {
            min: 100,
            max: 2000
          }
        }),
        isActive: true,
        displayOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sofas',
        description: 'Comfortable sofas for your living room',
        parentId: 1, // Living Room
        filters: JSON.stringify({
          material: ['Leather', 'Fabric', 'Microfiber'],
          color: ['Black', 'White', 'Brown', 'Gray', 'Beige', 'Blue', 'Green'],
          priceRange: {
            min: 500,
            max: 5000
          }
        }),
        isActive: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Add products
    await queryInterface.bulkInsert('Products', [
      {
        title: 'Modern Leather Sofa',
        shortDesc: 'Elegant modern leather sofa with chrome legs',
        longDesc: 'This elegant modern leather sofa features premium quality leather upholstery and sleek chrome legs. Perfect for contemporary living rooms, it offers both style and comfort with its ergonomic design and plush cushioning.',
        price: 1299.99,
        discountPrice: 1099.99,
        inStock: true,
        stockQuantity: 10,
        installationAvailable: true,
        installationDetails: 'Professional installation available for $99. Includes assembly and placement in your room of choice.',
        categoryId: 5, // Sofas
        material: 'Leather',
        color: 'Black',
        dimensions: JSON.stringify({
          length: 84,
          width: 36,
          height: 32,
          weight: 120
        }),
        isActive: true,
        sku: 'SOF-LTH-BLK-001',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Queen Size Platform Bed',
        shortDesc: 'Modern queen size platform bed with headboard',
        longDesc: 'This modern queen size platform bed features a stylish headboard and solid wood construction. The platform design eliminates the need for a box spring, and the clean lines make it perfect for contemporary bedrooms.',
        price: 899.99,
        discountPrice: null,
        inStock: true,
        stockQuantity: 5,
        installationAvailable: true,
        installationDetails: 'Professional installation available for $79. Includes assembly and placement in your bedroom.',
        categoryId: 2, // Bedroom
        material: 'Wood',
        color: 'Walnut',
        dimensions: JSON.stringify({
          length: 86,
          width: 64,
          height: 45,
          weight: 150
        }),
        isActive: true,
        sku: 'BED-PLT-WLT-001',
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Glass Dining Table',
        shortDesc: 'Modern glass dining table with chrome base',
        longDesc: 'This elegant glass dining table features a 12mm tempered glass top and a sturdy chrome base. The contemporary design makes it a perfect centerpiece for modern dining rooms, comfortably seating up to 6 people.',
        price: 749.99,
        discountPrice: 649.99,
        inStock: true,
        stockQuantity: 3,
        installationAvailable: false,
        installationDetails: null,
        categoryId: 3, // Dining Room
        material: 'Glass',
        color: 'Clear',
        dimensions: JSON.stringify({
          length: 72,
          width: 42,
          height: 30,
          weight: 100
        }),
        isActive: true,
        sku: 'DIN-TBL-GLS-001',
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Add product images
    await queryInterface.bulkInsert('ProductImages', [
      {
        productId: 1, // Modern Leather Sofa
        imageUrl: '/images/products/leather-sofa-1.jpg',
        altText: 'Modern black leather sofa - front view',
        isPrimary: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 1, // Modern Leather Sofa
        imageUrl: '/images/products/leather-sofa-2.jpg',
        altText: 'Modern black leather sofa - side view',
        isPrimary: false,
        displayOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 2, // Queen Size Platform Bed
        imageUrl: '/images/products/platform-bed-1.jpg',
        altText: 'Walnut queen size platform bed - front view',
        isPrimary: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 3, // Glass Dining Table
        imageUrl: '/images/products/glass-table-1.jpg',
        altText: 'Glass dining table with chrome base',
        isPrimary: true,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Add reviews
    await queryInterface.bulkInsert('Reviews', [
      {
        userId: 4, // Regular User
        productId: 1, // Modern Leather Sofa
        rating: 5,
        title: 'Excellent quality',
        comment: 'This sofa is amazing! The leather is soft yet durable, and it looks fantastic in my living room.',
        isVerifiedPurchase: true,
        isApproved: true,
        adminResponse: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 4, // Regular User
        productId: 2, // Queen Size Platform Bed
        rating: 4,
        title: 'Great bed, minor assembly issues',
        comment: 'The bed looks great and is very sturdy. Had some issues with assembly instructions, but customer service was helpful.',
        isVerifiedPurchase: true,
        isApproved: true,
        adminResponse: 'Thank you for your feedback. We\'re improving our assembly instructions based on your comments.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Remove data in reverse order
    await queryInterface.bulkDelete('Reviews', null, {});
    await queryInterface.bulkDelete('ProductImages', null, {});
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('AdminRoles', null, {});
  }
};
