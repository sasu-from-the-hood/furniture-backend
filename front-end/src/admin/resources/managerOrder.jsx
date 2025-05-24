import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  useRecordContext,
  useNotify,
  useRefresh,
  useListContext,
  useGetList,
} from 'react-admin';
import { useState, useEffect } from 'react';

// Status options with colors
const STATUS_OPTIONS = [
  { id: 'pending', name: 'Pending', color: '#f59e0b' },
  { id: 'confirmed', name: 'Confirmed', color: '#3b82f6' },
  // { id: 'processing', name: 'Processing', color: '#8b5cf6' },
  // { id: 'shipped', name: 'Shipped', color: '#10b981' },
  // { id: 'delivered', name: 'Delivered', color: '#059669' },
  // { id: 'cancelled', name: 'Cancelled', color: '#ef4444' },
];

// Get color for status
const getStatusColor = (statusId) => {
  const option = STATUS_OPTIONS.find(opt => opt.id === statusId);
  return option ? option.color : '#6b7280';
};

// Status Dropdown Component
const StatusDropdown = () => {
  const record = useRecordContext();
  const [status, setStatus] = useState(record.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    // Confirm before cancelling an order
    if (newStatus === 'cancelled' && !window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setStatus(newStatus);
    setIsUpdating(true);

    try {
      // Import API_URL from config
      const { API_URL } = await import('../../config/index.js');

      // Get the token from localStorage
      const token = localStorage.getItem('token');

      // Make a direct API call to the status update endpoint
      const response = await fetch(`${API_URL}/sales/orders/${record.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      // Show success notification with status-specific message
      const statusMessages = {
        'pending': 'Order marked as pending',
        'confirmed': 'Order confirmed successfully',
        'processing': 'Order is now being processed',
        'shipped': 'Order marked as shipped',
        'delivered': 'Order marked as delivered',
        'cancelled': 'Order has been cancelled'
      };

      const message = statusMessages[newStatus] || 'Order status updated successfully';
      notify(message, { type: 'success' });

      // Refresh the list to show the updated status
      refresh();
    } catch (error) {
      // Show error notification
      notify(`Error updating status: ${error.message}`, { type: 'error' });

      // Revert to the previous status
      setStatus(record.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-70 z-10">
          <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className="p-2 border rounded-md min-w-[140px]"
        style={{
          backgroundColor: 'white',
          border: `2px solid ${getStatusColor(status)}`,
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '14px',
          color: getStatusColor(status),
          fontWeight: 'bold',
        }}
      >
        {STATUS_OPTIONS.map(option => (
          <option
            key={option.id}
            value={option.id}
            style={{ color: option.color, fontWeight: 'normal' }}
          >
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Status Field Component
const StatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(record.status),
          marginRight: '8px'
        }}
      />
      <StatusDropdown />
    </div>
  );
};

// Custom List component with search functionality
export const ManagerOrderList = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const OrderList = () => {
    const { data, isLoading } = useListContext();
    const [filteredData, setFilteredData] = useState([]);
    const [userMap, setUserMap] = useState({});
    
    // Get all users to build a map of userId to user name
    const { data: users, isLoading: isLoadingUsers } = useGetList(
      'users',
      { pagination: { page: 1, perPage: 1000 } }
    );
    
    // Build a map of userId to user name when users data is loaded
    useEffect(() => {
      if (users) {
        const map = {};
        users.forEach(user => {
          map[user.id] = user.name;
        });
        setUserMap(map);
      }
    }, [users]);
    
    // Filter the data based on the search term and user map
    useEffect(() => {
      if (!data || isLoadingUsers) return;
      
      if (searchTerm.trim() === '') {
        setFilteredData(Object.values(data));
        return;
      }
      
      const filtered = Object.values(data).filter(record => {
        const userName = userMap[record.userId] || '';
        return userName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      setFilteredData(filtered);
    }, [data, searchTerm, userMap, isLoadingUsers]);
    
    if (isLoading || isLoadingUsers) return <div>Loading...</div>;
    
    return (
      <Datagrid data={filteredData}>
        <ReferenceField source="userId" reference="users">
          <TextField source="name" />
        </ReferenceField>
        <StatusField source="status" label="Status" />
        <DateField source="createdAt" />
        <NumberField source="total" options={{ style: 'currency', currency: 'ETB' }} />
      </Datagrid>
    );
  };

  return (
    <div>
      <div style={{ 
        padding: '16px', 
        backgroundColor: '', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search by user name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            width: '300px',
            fontSize: '14px'
          }}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            style={{
              marginLeft: '8px',
              padding: '6px 12px',
              backgroundColor: '',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>
      
      <List {...props} sort={{ field: 'createdAt', order: 'DESC' }}>
        <OrderList />
      </List>
    </div>
  );
};
