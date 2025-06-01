import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, Typography, Box, Grid,
  CircularProgress
} from '@mui/material';
import { Title, useDataProvider, useNotify } from 'react-admin';
import {
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

const SuperAdminDashboard = () => {
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

  // Dashboard cards data - now using dynamic values from API
  const cards = [
    {
      title: 'Users',
      icon: <PeopleIcon fontSize="large" />,
      value: dashboardData.counts?.users || 0,
      link: '/users',
    },
    {
      title: 'Products',
      icon: <InventoryIcon fontSize="large" />,
      value: dashboardData.counts?.products || 0,
      link: '/products',
    },
    {
      title: 'Orders',
      icon: <ShoppingCartIcon fontSize="large" />,
      value: dashboardData.counts?.orders || 0,
      link: '/orders',
    },
    {
      title: 'Categories',
      icon: <CategoryIcon fontSize="large" />,
      value: dashboardData.counts?.categories || 0,
      link: '/categories',
    },
  ];

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
          Super Admin Dashboard
        </Typography>

        <Typography variant="body1" gutterBottom>
          Welcome to the Super Admin Dashboard. You have full access to all system features.
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
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
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

        {/* Recent Orders and Top Products */}
        <Grid container spacing={2} sx={{ mt: 4 }}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Recent Orders" />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                  </Box>
                ) : dashboardData.recentOrders?.length > 0 ? (
                  <Box sx={{
                    overflowX: 'auto',
                    overflowY: 'auto',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    }
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd', width: '15%' }}>ID</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd', width: '35%' }}>Customer</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd', width: '25%' }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', width: '25%' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recentOrders.map((order) => (
                          <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `#/orders/${order.id}/show`}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.id}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.user?.name || 'N/A'}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                              <StatusBadge status={order.status} />
                            </td>
                            <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                              ${(() => {
                                if (!order.total) return '0.00';
                                if (typeof order.total === 'number') return order.total.toFixed(2);
                                const parsed = parseFloat(order.total);
                                return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Typography variant="body1" color="textSecondary" align="center" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No recent orders found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Top Products" />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                  </Box>
                ) : dashboardData.topProducts?.length > 0 ? (
                  <Box sx={{
                    overflowX: 'auto',
                    overflowY: 'auto',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    }
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd', width: '40%' }}>Product</th>
                          <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', width: '20%' }}>Price</th>
                          <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd', width: '20%' }}>Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.topProducts.map((product) => (
                          <tr key={product.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `#/products/${product.id}`}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</td>
                            <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                              ${(() => {
                                if (!product.price) return '0.00';
                                if (typeof product.price === 'number') return product.price.toFixed(2);
                                const parsed = parseFloat(product.price);
                                return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
                              })()}
                            </td>
                            <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                              {product.orderCount || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Typography variant="body1" color="textSecondary" align="center" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No product data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;