const { Setting, sequelize } = require('../../models');

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
