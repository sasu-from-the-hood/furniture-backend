'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Settings', [
      {
        key: 'site_name',
        value: 'Furniture Catalog',
        type: 'text',
        group: 'general',
        description: 'Website name',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'site_logo',
        value: '/images/logo.png',
        type: 'image',
        group: 'general',
        description: 'Website logo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'site_favicon',
        value: '/images/favicon.ico',
        type: 'image',
        group: 'general',
        description: 'Website favicon',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'contact_email',
        value: 'contact@example.com',
        type: 'text',
        group: 'contact',
        description: 'Contact email address',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'contact_phone',
        value: '+1 (123) 456-7890',
        type: 'text',
        group: 'contact',
        description: 'Contact phone number',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'contact_address',
        value: '123 Furniture St, City, State, 12345',
        type: 'text',
        group: 'contact',
        description: 'Physical address',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'social_facebook',
        value: 'https://facebook.com/furniturecatalog',
        type: 'text',
        group: 'social',
        description: 'Facebook page URL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/furniturecatalog',
        type: 'text',
        group: 'social',
        description: 'Instagram profile URL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'about_content',
        value: '<h1>About Us</h1><p>Welcome to Furniture Catalog, your premier destination for high-quality furniture.</p>',
        type: 'html',
        group: 'pages',
        description: 'About page content',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'privacy_policy',
        value: '<h1>Privacy Policy</h1><p>This is the privacy policy for Furniture Catalog.</p>',
        type: 'html',
        group: 'pages',
        description: 'Privacy policy content',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'terms_conditions',
        value: '<h1>Terms and Conditions</h1><p>These are the terms and conditions for Furniture Catalog.</p>',
        type: 'html',
        group: 'pages',
        description: 'Terms and conditions content',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'home_banner',
        value: '/images/banner.jpg',
        type: 'image',
        group: 'home',
        description: 'Home page banner image',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'home_banner_text',
        value: 'Discover our premium furniture collection',
        type: 'text',
        group: 'home',
        description: 'Home page banner text',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'home_featured_categories',
        value: JSON.stringify([1, 2, 3]),
        type: 'json',
        group: 'home',
        description: 'Featured categories on home page',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'tax_rate',
        value: '7.5',
        type: 'number',
        group: 'shop',
        description: 'Default tax rate percentage',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'shipping_fee',
        value: '50',
        type: 'number',
        group: 'shop',
        description: 'Default shipping fee',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Settings', null, {});
  }
};
