'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Settings', [
      {
        key: 'hero_title',
        value: 'Elegant Furniture for Modern Living',
        type: 'text',
        group: 'home',
        description: 'Main title for the home page hero section',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'hero_subtitle',
        value: 'Transform your space with our exclusive collection',
        type: 'text',
        group: 'home',
        description: 'Subtitle for the home page hero section',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'why_choose_us_title',
        value: 'Why Choose Us?',
        type: 'text',
        group: 'home',
        description: 'Title for the Why Choose Us section',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'why_choose_us_reasons',
        value: JSON.stringify([
          { title: 'Craftsmanship', description: 'Experience unmatched quality and detail in every product.' },
          { title: 'Sustainability', description: 'We prioritize eco-friendly and ethical practices.' },
          { title: 'Exclusivity', description: 'Our collections are curated to offer unique and timeless elegance.' }
        ]),
        type: 'json',
        group: 'home',
        description: 'Reasons listed in the Why Choose Us section',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'video_url',
        value: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        type: 'text',
        group: 'home',
        description: 'URL for the video in the home page',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'testimonials',
        value: JSON.stringify([
          { 
            quote: 'Their products are truly exquisite and add elegance to any space.', 
            author: 'Alex Johnson' 
          },
          { 
            quote: 'Exceptional craftsmanship and quality. Highly recommended!', 
            author: 'Sarah Williams' 
          },
          { 
            quote: 'European Luxury is my go-to for elegant and unique home pieces.', 
            author: 'Michael Lee' 
          }
        ]),
        type: 'json',
        group: 'home',
        description: 'Customer testimonials displayed on the home page',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Settings', {
      key: [
        'hero_title',
        'hero_subtitle',
        'why_choose_us_title',
        'why_choose_us_reasons',
        'video_url',
        'testimonials'
      ],
      group: 'home'
    }, {});
  }
};
