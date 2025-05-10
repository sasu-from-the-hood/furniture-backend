import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, Typography, Box, Grid,
} from '@mui/material';
import { Title, useDataProvider, useNotify } from 'react-admin';
import {
  Category as CategoryIcon,
  Inventory as InventoryIcon,
   Star as StarIcon,
} from '@mui/icons-material';

const MangerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    counts: {
      users: 0,
      products: 0,
      orders: 0,
      categories: 0
    },
    recentOrders: [],
    topProducts: []
  });
  const dataProvider = useDataProvider();
  const notify = useNotify();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await dataProvider.customQuery({
          type: 'GET_ONE',
          resource: 'dashboard',
          payload: { id: 'summary' }
        });

        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        notify('Error loading dashboard data', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dataProvider, notify]);

  // Dashboard cards data based on the fetched data
  const cards = dashboardData ? [
    {
      title: 'Products',
      icon: <InventoryIcon fontSize="large" color="primary" />,
      value: dashboardData.counts?.products || 0,
      link: '/products',
    },
    {
      title: 'Categories',
      icon: <CategoryIcon fontSize="large" color="primary" />,
      value: dashboardData.counts?.categories || 0,
      link: '/categories',
    },
    {
      title: 'Reviews',
      icon: <StarIcon fontSize="large" color="primary" />,
      value: dashboardData.topProducts?.length || 0,
      link: '/reviews',
    },
  ] : [];

  // Status Badge Component (without colors)
  const StatusBadge = ({ status }) => (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
    }}>
      {status}
    </span>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 48px)', overflow: 'auto', width: '100%' }}>
      <Title title="Super Admin Dashboard" />

      <Box sx={{ p: 2, maxWidth: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Manger Dashboard
        </Typography>

        <Typography variant="body1" gutterBottom>
          Welcome to the  Product Manger Dashboard.
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mt: 2, width: '100%' }}>
          {cards.map((card, index) => (
            <Grid item xs={3} key={index} sx={{ flex: 1 }}>
              <Card
                sx={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => window.location.href = `#${card.link}`}
              >
                <CardHeader
                  title={card.title}
                  avatar={card.icon}
                  sx={{
                    p: { xs: 1, sm: 2 },
                    width: '100%',
                    '& .MuiCardHeader-content': { minWidth: 0, width: '100%' },
                    '& .MuiCardHeader-title': {
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 }, width: '100%' }}>
                  {card.value !== undefined && (
                    <Typography
                      variant="h3"
                      component="div"
                      align="center"
                      sx={{
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                      }}
                    >
                      {card.value}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MangerDashboard;
