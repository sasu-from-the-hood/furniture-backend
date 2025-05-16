import React, { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  useRecordContext,
  TopToolbar,
  ExportButton,
  useGetOne,
} from 'react-admin';
import { Box } from '@mui/material';
import { Email, Phone, ContactPhone } from '@mui/icons-material';
import axiosInstance from '../../hooks/axiosInstance';



// Product name field
const ProductNameField = () => {
  const record = useRecordContext();
  const [productName, setProductName] = useState('');

  useEffect(() => {
    if (record && record.productId) {
      const fetchProductName = async () => {
        try {
          const response = await axiosInstance.get(`/superadmin/products/${record.productId}`);
          if (response.data && response.data.product) {
            setProductName(response.data.product.title || response.data.product.name || 'Unknown Product');
          }
        } catch (error) {
          console.error('Error fetching product name:', error);
          setProductName('Unknown Product');
        }
      };

      fetchProductName();
    }
  }, [record]);

  if (!record || !record.productId) return <span>No product</span>;

  return <span>{productName || 'Loading...'}</span>;
};

// Message field with truncation
const MessageField = () => {
  const record = useRecordContext();
  if (!record || !record.message) return null;

  // Truncate message to 50 characters
  const truncatedMessage = record.message.length > 50
    ? record.message.substring(0, 50) + '...'
    : record.message;

  return <span title={record.message}>{truncatedMessage}</span>;
};

// Contact method field with icons
const ContactMethodField = () => {
  const record = useRecordContext();
  if (!record) return null;

  switch (record.preferredContactMethod) {
    case 'email':
      return (
        <Box display="flex" alignItems="center">
          <Email fontSize="small" color="primary" style={{ marginRight: 8 }} />
          <span>Email</span>
        </Box>
      );
    case 'phone':
      return (
        <Box display="flex" alignItems="center">
          <Phone fontSize="small" color="primary" style={{ marginRight: 8 }} />
          <span>Phone</span>
        </Box>
      );
    case 'both':
      return (
        <Box display="flex" alignItems="center">
          <ContactPhone fontSize="small" color="primary" style={{ marginRight: 8 }} />
          <span>Email & Phone</span>
        </Box>
      );
    default:
      return <span>{record.preferredContactMethod}</span>;
  }
};

// List actions
const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

// Inquiry List component
export const InquiryList = (props) => (
  <List
    {...props}
    actions={<ListActions />}
    sort={{ field: 'createdAt', order: 'DESC' }}
    bulkActionButtons={false}
  >
    <Datagrid>
      <ReferenceField source="userId" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <ProductNameField label="Product Name" />
      <MessageField source="message" label="Message" />
      <ContactMethodField source="preferredContactMethod" />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);


