const { Setting, sequelize } = require('../../models');

exports.getFooterSettings = async (req, res) => {
  try {
    // Get settings for footer - includes contact, social, and footer-specific settings
    const footerSettings = await Setting.findAll({
      where: {
        group: ['contact', 'social', 'footer']
      },
      order: [['group', 'ASC'], ['key', 'ASC']]
    });

    // Format settings as key-value pairs grouped by group
    const formattedSettings = footerSettings.reduce((acc, setting) => {
      if (!acc[setting.group]) {
        acc[setting.group] = {};
      }

      let value = setting.value;

      // Parse value based on type
      if (setting.type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch (error) {
          console.error(`Error parsing JSON for setting ${setting.key}:`, error);
        }
      } else if (setting.type === 'boolean' && value) {
        value = value.toLowerCase() === 'true';
      } else if (setting.type === 'number' && value) {
        value = parseFloat(value);
      }

      acc[setting.group][setting.key] = {
        value,
        type: setting.type,
        description: setting.description
      };

      return acc;
    }, {});

    // Also get the site name from general settings
    const siteNameSetting = await Setting.findOne({
      where: { key: 'site_name' }
    });

    if (siteNameSetting) {
      if (!formattedSettings.general) {
        formattedSettings.general = {};
      }

      formattedSettings.general.site_name = {
        value: siteNameSetting.value,
        type: siteNameSetting.type,
        description: siteNameSetting.description
      };
    }

    res.json({ settings: formattedSettings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllSettings = async (req, res) => {
  try {
    const { group } = req.query;

    const whereClause = {};
    if (group) {
      whereClause.group = group;
    }

    const settings = await Setting.findAll({
      where: whereClause,
      order: [['group', 'ASC'], ['key', 'ASC']]
    });

    // Format settings as key-value pairs grouped by group
    const formattedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.group]) {
        acc[setting.group] = {};
      }

      let value = setting.value;

      // Parse value based on type
      if (setting.type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch (error) {
          console.error(`Error parsing JSON for setting ${setting.key}:`, error);
        }
      } else if (setting.type === 'boolean' && value) {
        value = value.toLowerCase() === 'true';
      } else if (setting.type === 'number' && value) {
        value = parseFloat(value);
      }

      acc[setting.group][setting.key] = {
        value,
        type: setting.type,
        description: setting.description
      };

      return acc;
    }, {});

    res.json({ settings: formattedSettings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await Setting.findOne({
      where: { key }
    });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    let value = setting.value;

    // Parse value based on type
    if (setting.type === 'json' && value) {
      try {
        value = JSON.parse(value);
      } catch (error) {
        console.error(`Error parsing JSON for setting ${setting.key}:`, error);
      }
    } else if (setting.type === 'boolean' && value) {
      value = value.toLowerCase() === 'true';
    } else if (setting.type === 'number' && value) {
      value = parseFloat(value);
    }

    res.json({
      setting: {
        key: setting.key,
        value,
        type: setting.type,
        group: setting.group,
        description: setting.description
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await Setting.findOne({
      where: { key }
    });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    let processedValue = value;

    // Format value based on type
    if (setting.type === 'json' && typeof value !== 'string') {
      processedValue = JSON.stringify(value);
    } else if (setting.type === 'boolean') {
      processedValue = value.toString();
    } else if (setting.type === 'number') {
      processedValue = value.toString();
    }

    await setting.update({ value: processedValue });

    res.json({
      message: 'Setting updated successfully',
      setting: {
        key: setting.key,
        value: processedValue,
        type: setting.type,
        group: setting.group
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const { key, value, type, group, description } = req.body;

    const existingSetting = await Setting.findOne({
      where: { key }
    });

    if (existingSetting) {
      return res.status(400).json({ message: 'Setting with this key already exists' });
    }

    const validTypes = ['text', 'html', 'json', 'boolean', 'number', 'image'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid setting type',
        validTypes
      });
    }

    let processedValue = value;

    // Format value based on type
    if (type === 'json' && typeof value !== 'string') {
      processedValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      processedValue = value.toString();
    } else if (type === 'number') {
      processedValue = value.toString();
    }

    const setting = await Setting.create({
      key,
      value: processedValue,
      type,
      group: group || 'general',
      description
    });

    res.status(201).json({
      message: 'Setting created successfully',
      setting: {
        key: setting.key,
        value: processedValue,
        type: setting.type,
        group: setting.group,
        description: setting.description
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await Setting.findOne({
      where: { key }
    });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await setting.destroy();

    res.json({
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.bulkUpdateSettings = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Settings array is required' });
    }

    const results = [];

    for (const item of settings) {
      const { key, value } = item;

      if (!key) {
        continue;
      }

      const setting = await Setting.findOne({
        where: { key },
        transaction
      });

      if (!setting) {
        results.push({
          key,
          success: false,
          message: 'Setting not found'
        });
        continue;
      }

      let processedValue = value;

      // Format value based on type
      if (setting.type === 'json' && typeof value !== 'string') {
        processedValue = JSON.stringify(value);
      } else if (setting.type === 'boolean') {
        processedValue = value.toString();
      } else if (setting.type === 'number') {
        processedValue = value.toString();
      }

      await setting.update({ value: processedValue }, { transaction });

      results.push({
        key,
        success: true,
        message: 'Updated successfully'
      });
    }

    await transaction.commit();

    res.json({
      message: 'Settings updated successfully',
      results
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get only the basic site settings
exports.getBasicSettings = async (req, res) => {
  try {
    // Define the specific settings we want to retrieve
    const settingKeys = [
      // General settings
      'site_name',
      'site_description',
      'site_logo',
      'site_favicon',

      // Contact settings
      'contact_email',
      'contact_phone',
      'contact_address',

      // Social settings
      'social_facebook',
      'social_instagram',

      // Home settings
      'hero_title',
      'hero_subtitle',
      'why_choose_us_title',
      'why_choose_us_reasons',
      'video_url',
      'testimonials'
    ];

    // Get all the requested settings
    const settings = await Setting.findAll({
      where: {
        key: settingKeys
      },
      order: [['group', 'ASC'], ['key', 'ASC']]
    });

    // Format settings as key-value pairs grouped by group
    const formattedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.group]) {
        acc[setting.group] = {};
      }

      let value = setting.value;

      // Parse value based on type
      if (setting.type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch (error) {
          console.error(`Error parsing JSON for setting ${setting.key}:`, error);
          value = [];
        }
      } else if (setting.type === 'boolean' && value) {
        value = value.toLowerCase() === 'true';
      } else if (setting.type === 'number' && value) {
        value = parseFloat(value);
      }

      acc[setting.group][setting.key] = {
        value,
        type: setting.type,
        description: setting.description
      };

      return acc;
    }, {});

    // Create a flat structure for easier frontend consumption
    const flatSettings = {
      site_name: formattedSettings.general?.site_name?.value || 'Furniture Catalog',
      site_description: formattedSettings.general?.site_description?.value || 'Quality furniture for your home',
      site_logo: formattedSettings.general?.site_logo?.value || '',
      site_favicon: formattedSettings.general?.site_favicon?.value || '',

      contact_email: formattedSettings.contact?.contact_email?.value || '',
      contact_phone: formattedSettings.contact?.contact_phone?.value || '',
      contact_address: formattedSettings.contact?.contact_address?.value || '',

      social_facebook: formattedSettings.social?.social_facebook?.value || '',
      social_instagram: formattedSettings.social?.social_instagram?.value || '',

      hero_title: formattedSettings.home?.hero_title?.value || 'Elegant Furniture for Modern Living',
      hero_subtitle: formattedSettings.home?.hero_subtitle?.value || 'Transform your space with our exclusive collection',
      why_choose_us_title: formattedSettings.home?.why_choose_us_title?.value || 'Why Choose Us?',
      why_choose_us_reasons: formattedSettings.home?.why_choose_us_reasons?.value || [],
      video_url: formattedSettings.home?.video_url?.value || '',
      testimonials: formattedSettings.home?.testimonials?.value || []
    };

    res.json({
      settings: formattedSettings,
      flatSettings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update basic site settings
exports.updateBasicSettings = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      site_name,
      site_description,
      site_logo,
      site_favicon,
      contact_email,
      contact_phone,
      contact_address,
      social_facebook,
      social_instagram,
      hero_title,
      hero_subtitle,
      why_choose_us_title,
      why_choose_us_reasons,
      video_url,
      testimonials
    } = req.body;

    // Create an array of settings to update
    const settingsToUpdate = [
      { key: 'site_name', value: site_name, group: 'general', type: 'text' },
      { key: 'site_description', value: site_description, group: 'general', type: 'text' },
      { key: 'site_logo', value: site_logo, group: 'general', type: 'image' },
      { key: 'site_favicon', value: site_favicon, group: 'general', type: 'image' },

      { key: 'contact_email', value: contact_email, group: 'contact', type: 'text' },
      { key: 'contact_phone', value: contact_phone, group: 'contact', type: 'text' },
      { key: 'contact_address', value: contact_address, group: 'contact', type: 'text' },

      { key: 'social_facebook', value: social_facebook, group: 'social', type: 'text' },
      { key: 'social_instagram', value: social_instagram, group: 'social', type: 'text' },

      { key: 'hero_title', value: hero_title, group: 'home', type: 'text' },
      { key: 'hero_subtitle', value: hero_subtitle, group: 'home', type: 'text' },
      { key: 'why_choose_us_title', value: why_choose_us_title, group: 'home', type: 'text' },
      { key: 'video_url', value: video_url, group: 'home', type: 'text' }
    ];

    // Add JSON fields if they exist
    if (why_choose_us_reasons) {
      settingsToUpdate.push({
        key: 'why_choose_us_reasons',
        value: typeof why_choose_us_reasons === 'string' ? why_choose_us_reasons : JSON.stringify(why_choose_us_reasons),
        group: 'home',
        type: 'json'
      });
    }

    if (testimonials) {
      settingsToUpdate.push({
        key: 'testimonials',
        value: typeof testimonials === 'string' ? testimonials : JSON.stringify(testimonials),
        group: 'home',
        type: 'json'
      });
    }

    const results = [];

    // Update or create each setting
    for (const item of settingsToUpdate) {
      const { key, value, group, type } = item;

      let setting = await Setting.findOne({
        where: { key },
        transaction
      });

      if (!setting) {
        // Create the setting if it doesn't exist
        setting = await Setting.create({
          key,
          value,
          type,
          group,
          description: `${key} setting`
        }, { transaction });

        results.push({
          key,
          success: true,
          message: 'Created successfully'
        });
      } else {
        // Update existing setting
        await setting.update({ value }, { transaction });

        results.push({
          key,
          success: true,
          message: 'Updated successfully'
        });
      }
    }

    await transaction.commit();

    res.json({
      message: 'Settings updated successfully',
      results
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
