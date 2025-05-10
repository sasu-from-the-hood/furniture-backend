import React, { useContext } from 'react';
import { ShopContext } from '../../compontes/context/ShopContext';
import SuperAdminDashboard from '../roles/superAdmin/index.jsx';
import ProductManagerDashboard from '../roles/admin/index.jsx';
import SalesAdminDashboard from '../roles/manager/index.jsx';
import { Typography, Box, Card, CardContent } from '@mui/material';
import { Title } from 'react-admin';

const Dashboard = () => {
  const { userRole } = useContext(ShopContext);

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case 'Super Admin':
        return (
          <Box sx={{ width: '100%', padding: 2 }}>
            <Title title="Dashboard" />
            <SuperAdminDashboard />
          </Box>
        );
      case 'Product Manager':
        return (
          <Box sx={{ width: '100%', padding: 2 }}>
            <Title title="Dashboard" />
            <ProductManagerDashboard />
          </Box>
        );
      case 'Sales Admin':
        return (
          <Box sx={{ width: '100%', padding: 2 }}>
            <Title title="Dashboard" />
            <SalesAdminDashboard />
          </Box>
        );
      default:
        return (
          <Box sx={{ width: '100%', padding: 2 }}>
            <Title title="Access Denied" />
            <Card>
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                  Access Denied
                </Typography>
                <Typography variant="body1">
                  You don&apos;t have permission to access the admin dashboard.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;
