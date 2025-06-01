import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, ButtonGroup, Grid } from '@mui/material';
import { useDataProvider } from 'react-admin';
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const Analytics = () => {
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('sales'); // 'sales' or 'products'
  const dataProvider = useDataProvider();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch sales data
        console.log('Fetching sales data using dataProvider...');
        const salesResponse = await dataProvider.customQuery({
          type: 'GET_ONE',
          resource: 'analytics/sales',
        });
        console.log('Sales data received:', salesResponse.data);
        setSalesData(salesResponse.data);
        
        // Fetch product data
        console.log('Fetching product data using dataProvider...');
        const productResponse = await dataProvider.customQuery({
          type: 'GET_ONE',
          resource: 'analytics/products',
        });
        console.log('Product data received:', productResponse.data);
        setProductData(productResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchData();
  }, [dataProvider]);

  if (loading) return <Typography>Loading analytics data...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // SALES DATA PROCESSING
  // Check if sales data exists and has items
  const hasCategoryData = salesData?.salesByCategory && salesData.salesByCategory.length > 0;
  const hasTimeData = salesData?.salesByTimePeriod && salesData.salesByTimePeriod.length > 0;
  const hasProductData = salesData?.topSellingProducts && salesData.topSellingProducts.length > 0;
  
  // Create data representation for the pie chart
  const salesByCategoryData = hasCategoryData 
    ? salesData.salesByCategory.map(item => ({
        name: item.product?.category?.name || 'Unknown',
        value: parseFloat(item.totalSales || 0)
      }))
    : [];

  // Create data representation for the time period chart
  const salesByTimeData = hasTimeData
    ? salesData.salesByTimePeriod.map(item => ({
        period: item.period || '',
        orders: parseInt(item.orderCount || 0),
        sales: parseFloat(item.totalSales || 0)
      }))
    : [];

  // Create data representation for the top products chart
  const topProductsData = hasProductData
    ? salesData.topSellingProducts.map(item => ({
        name: item.product?.title || 'Unknown',
        quantity: parseInt(item.totalQuantity || 0),
        sales: parseFloat(item.totalSales || 0)
      }))
    : [];

  // PRODUCT DATA PROCESSING
  // Check if product data exists and has items
  const hasProductsByCategory = productData?.productsByCategory && productData.productsByCategory.length > 0;
  const hasProductsByStatus = productData?.productsByStatus && productData.productsByStatus.length > 0;
  const hasMostReviewed = productData?.mostReviewedProducts && productData.mostReviewedProducts.length > 0;
  const hasMostInquired = productData?.mostInquiredProducts && productData.mostInquiredProducts.length > 0;

  // Create data representation for products by category
  const productsByCategoryData = hasProductsByCategory
    ? productData.productsByCategory.map(item => ({
        name: item.category?.name || 'Unknown',
        count: parseInt(item.productCount || 0)
      }))
    : [];

  // Create data representation for products by status
  const productsByStatusData = hasProductsByStatus
    ? productData.productsByStatus.map(item => ({
        name: item.inStock ? 'In Stock' : 'Out of Stock',
        count: parseInt(item.productCount || 0)
      }))
    : [];

  // Create data representation for most reviewed products
  const mostReviewedProductsData = hasMostReviewed
    ? productData.mostReviewedProducts.map(item => ({
        name: item.product?.title || 'Unknown',
        reviews: parseInt(item.reviewCount || 0),
        rating: parseFloat(item.avgRating || 0).toFixed(1)
      }))
    : [];

  // Create data representation for most inquired products
  const mostInquiredProductsData = hasMostInquired
    ? productData.mostInquiredProducts.map(item => ({
        name: item.product?.title || 'Unknown',
        inquiries: parseInt(item.inquiryCount || 0)
      }))
    : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* View Selection Buttons */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <ButtonGroup variant="contained" aria-label="analytics view selection">
          <Button 
            onClick={() => setActiveView('sales')}
            variant={activeView === 'sales' ? 'contained' : 'outlined'}
            color="primary"
            sx={{ px: 4, py: 1 }}
          >
            Sales Analytics
          </Button>
          <Button 
            onClick={() => setActiveView('products')}
            variant={activeView === 'products' ? 'contained' : 'outlined'}
            color="primary"
            sx={{ px: 4, py: 1 }}
          >
            Product Analytics
          </Button>
        </ButtonGroup>
      </Box>

      {/* SALES ANALYTICS VIEW */}
      {activeView === 'sales' && (
        <>
          {/* Sales by Time Period - Line Chart */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Sales Over Time</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This chart shows sales and order trends over time.
            </Typography>
            
            {hasTimeData ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesByTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" name="Sales ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No sales time data available. Data will appear here when sales are recorded.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Sales by Category - Pie Chart */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Sales by Category</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This chart shows the distribution of sales across different product categories.
              Each segment represents a category's contribution to total sales.
            </Typography>
            
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={salesByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {salesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No category sales data available. Data will appear here when sales are recorded.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Top Selling Products - Bar Chart */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Top Selling Products</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This chart shows the best-selling products by quantity sold and sales revenue.
            </Typography>
            
            {hasProductData ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'quantity' ? 'Quantity' : 'Sales ($)']} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
                  <Bar dataKey="sales" fill="#82ca9d" name="Sales ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No product sales data available. Data will appear here when sales are recorded.
                </Typography>
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* PRODUCT ANALYTICS VIEW */}
      {activeView === 'products' && (
        <>
          {/* Products by Category - Pie Chart */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Products by Category</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This chart shows the distribution of products across different categories.
              Each segment represents the number of products in each category.
            </Typography>
            
            {hasProductsByCategory ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={productsByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {productsByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} products`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No product category data available. Data will appear here when products are added.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Products by Status - Pie Chart */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Products by Stock Status</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This chart shows the distribution of products by their stock status.
            </Typography>
            
            {hasProductsByStatus ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={productsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#82ca9d" /> {/* In Stock */}
                    <Cell fill="#ff8042" /> {/* Out of Stock */}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} products`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No product status data available. Data will appear here when products are added.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Most Reviewed Products - Bar Chart */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Most Reviewed Products</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This chart shows products with the most reviews and their average ratings.
            </Typography>
            
            {hasMostReviewed ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={mostReviewedProductsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reviews" fill="#8884d8" name="Number of Reviews" />
                  <Bar dataKey="rating" fill="#82ca9d" name="Average Rating (out of 5)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No product review data available. Data will appear here when products receive reviews.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Most Inquired Products - Bar Chart */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Most Inquired Products</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              This chart shows products that have received the most customer inquiries.
            </Typography>
            
            {hasMostInquired ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={mostInquiredProductsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inquiries" fill="#8884d8" name="Number of Inquiries" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No product inquiry data available. Data will appear here when products receive inquiries.
                </Typography>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Analytics;