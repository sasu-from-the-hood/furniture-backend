'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Settings', [
      {
        key: 'footer_about',
        value: 'We specialize in high-quality, stylish furniture designed to bring comfort and elegance to every space.',
        type: 'text',
        group: 'footer',
        description: 'About us text in footer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'footer_address',
        value: '123 Furniture Lane, Hometown, ST 12345',
        type: 'text',
        group: 'footer',
        description: 'Address displayed in footer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'footer_copyright',
        value: 'All rights reserved.',
        type: 'text',
        group: 'footer',
        description: 'Copyright text in footer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'footer_quick_links',
        value: JSON.stringify([
          { title: 'Home', url: '/' },
          { title: 'Shop', url: '/shop' },
          { title: 'About Us', url: '/about' },
          { title: 'Contact', url: '/contact' }
        ]),
        type: 'json',
        group: 'footer',
        description: 'Quick links in footer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'footer_customer_service',
        value: JSON.stringify([
          { title: 'FAQs', url: '/faqs' },
          { title: 'Shipping & Returns', url: '/shipping' },
          { title: 'Privacy Policy', url: '/privacy' },
          { title: 'Terms of Service', url: '/terms' }
        ]),
        type: 'json',
        group: 'footer',
        description: 'Customer service links in footer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'social_twitter',
        value: 'https://twitter.com/furniturecatalog',
        type: 'text',
        group: 'social',
        description: 'Twitter profile URL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'social_linkedin',
        value: 'https://linkedin.com/company/furniturecatalog',
        type: 'text',
        group: 'social',
        description: 'LinkedIn company URL',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Settings', {
      key: [
        'footer_about',
        'footer_address',
        'footer_copyright',
        'footer_quick_links',
        'footer_customer_service',
        'social_twitter',
        'social_linkedin'
      ]
    }, {});
  }
};
