import React, { useContext } from 'react';
import { Menu, useResourceDefinitions } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../../compontes/context/ShopContext';
import { Settings as SettingsIcon } from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const CustomMenu = (props) => {
  const resources = useResourceDefinitions();
  const navigate = useNavigate();
  const { userRole } = useContext(ShopContext);

  // Only show site settings for Super Admin
  const showSiteSettings = userRole === 'Super Admin';

  const handleSiteSettingsClick = () => {
    navigate('/dashboard/settings');
  };

  return (
    <Menu {...props}>
      {/* Standard Menu */}
      <Menu.DashboardItem />
      <Menu.ResourceItems />

      {/* Custom Menu Items */}
      {showSiteSettings && (
        <MenuItem onClick={handleSiteSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Site Settings" />
        </MenuItem>
      )}
    </Menu>
  );
};

export default CustomMenu;
