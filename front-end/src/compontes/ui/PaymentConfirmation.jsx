import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { API_URL } from "../../config";

function PaymentConfirmation() {
  const { tx_ref } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [paymentData, setPaymentData] = useState(null); // Added to store raw payment data
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const receiptRef = useRef();

  // Use browser's native print functionality instead of react-to-print
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-to-print');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Reload the component to restore React functionality
    window.location.reload();
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);

        // Get transaction reference from URL parameters or query parameters
        let txRef = tx_ref;

        // If not in URL path, try to get from query parameters
        if (!txRef) {
          const queryParams = new URLSearchParams(location.search);
          txRef = queryParams.get('tx_ref');
        }

        if (!txRef) {
          throw new Error('Transaction reference not found in URL');
        }

        console.log('Verifying payment with tx_ref:', txRef);

        // Verify payment with backend
        const response = await fetch(`${API_URL}/payment/chapa/verify/${txRef}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          // If token expired, try to handle gracefully
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again to view your order status.');
          }
          throw new Error(data.message || 'Failed to verify payment');
        }

        // Store the entire payment data for display
        if (data.data) {
          setPaymentData(data.data);
          console.log("Payment data received:", data.data);
        } else {
          console.log("Direct payment data:", data);
          setPaymentData(data);
        }

        setPaymentStatus(data.status || (data.data && data.data.status));

        // Store receipt data if available
        if (data.receiptData) {
          setReceiptData(data.receiptData);
        } else if (data.data) {
          // Handle the case where data is nested under 'data' property
          setReceiptData(data.data);
        }

        // If we have order details from the verification response, use them
        if (data.order) {
          setOrderDetails(data.order);
        } else if (data.data?.order) {
          // Check if order is nested under data property
          setOrderDetails(data.data.order);
        }
        // Otherwise fetch order details separately
        else if (data.order?.id || data.data?.order?.id) {
          const orderId = data.order?.id || data.data?.order?.id;
          const orderResponse = await fetch(`${API_URL}/user/orders/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          const orderData = await orderResponse.json();

          if (!orderResponse.ok) {
            console.warn('Failed to fetch additional order details:', orderData.message);
            // Still use the basic order info we have
            setOrderDetails(data.order || data.data?.order || {});
          } else {
            setOrderDetails(orderData);
          }
        } else {
          console.warn('No order ID found in verification response');
          setOrderDetails({
            id: 'Unknown',
            status: data.status === 'success' ? 'confirmed' : 'pending',
            paymentStatus: data.status === 'success' ? 'paid' : 'pending'
          });
        }

      } catch (err) {
        console.error('Payment verification error:', err);

        // If we haven't reached max retries and it might be a timing issue, retry
        if (retryCount < MAX_RETRIES &&
            (err.message.includes('not found') || err.message.includes('pending'))) {
          console.log(`Retrying payment verification (${retryCount + 1}/${MAX_RETRIES})...`);
          setRetryCount(prevCount => prevCount + 1);
          // Wait 2 seconds before retrying
          setTimeout(() => verifyPayment(), 2000);
          return;
        }

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tx_ref || location.search.includes('tx_ref')) {
      verifyPayment();
    } else {
      setError('No transaction reference provided');
      setLoading(false);
    }
  }, [tx_ref, location.search, retryCount]);

  // Organize payment data into categories for better display
  const organizePaymentData = (data) => {
    if (!data || typeof data !== 'object') return {};
    
    // Define categories for organizing data
    const categories = {
      transactionDetails: ['tx_ref', 'reference', 'amount', 'currency', 'status', 'payment_type', 'payment_date', 'created_at', 'paid_at'],
      customerInfo: ['first_name', 'last_name', 'email', 'phone', 'customer_id', 'customer_name', 'customer_email', 'customer_phone'],
      orderInfo: ['order_id', 'order_ref', 'order_status', 'items', 'shipping', 'billing'],
      paymentProvider: ['processor_response', 'provider', 'provider_reference', 'provider_id', 'provider_status'],
      metadata: ['meta', 'metadata', 'custom_fields']
    };
    
    // Initialize result object with categories
    const result = {
      transactionDetails: {},
      customerInfo: {},
      orderInfo: {},
      paymentProvider: {},
      metadata: {},
      other: {} // For fields that don't fit in any category
    };
    
    // Helper function to check if a key belongs to a category
    const getCategoryForKey = (key) => {
      for (const [category, keys] of Object.entries(categories)) {
        if (keys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
          return category;
        }
      }
      return 'other';
    };
    
    // Flatten nested objects for easier categorization
    const flattenObject = (obj, prefix = '') => {
      return Object.keys(obj).reduce((acc, key) => {
        const prefixedKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(acc, flattenObject(obj[key], prefixedKey));
        } else {
          acc[prefixedKey] = obj[key];
        }
        
        return acc;
      }, {});
    };
    
    // Process each key in the data
    Object.entries(data).forEach(([key, value]) => {
      // Handle nested objects specially
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Check if this is a well-known object that should be kept together
        const category = getCategoryForKey(key);
        if (Object.keys(categories).includes(key) || 
            (category !== 'other' && Object.keys(value).length <= 5)) {
          result[category][key] = value;
        } else {
          // Otherwise flatten it
          const flattened = flattenObject(value, key);
          Object.entries(flattened).forEach(([flatKey, flatValue]) => {
            const flatCategory = getCategoryForKey(flatKey);
            result[flatCategory][flatKey] = flatValue;
          });
        }
      } else {
        // Simple values
        const category = getCategoryForKey(key);
        result[category][key] = value;
      }
    });
    
    // Remove empty categories
    Object.keys(result).forEach(category => {
      if (Object.keys(result[category]).length === 0) {
        delete result[category];
      }
    });
    
    return result;
  };

  // Render a category of payment data
  const renderDataCategory = (title, data) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(data).map(([key, value]) => {
            // Skip rendering empty objects or arrays
            if (
              (typeof value === 'object' && value !== null && Object.keys(value).length === 0) ||
              (Array.isArray(value) && value.length === 0)
            ) {
              return null;
            }
            
            return (
              <div key={key} className="mb-2 bg-gray-50 p-2 rounded">
                <p className="text-gray-500 text-sm font-medium">{key.split('.').pop()}:</p>
                {renderValue(value)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Helper to render different value types
  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return <p className="font-medium text-gray-400">N/A</p>;
    }
    
    if (typeof value === 'boolean') {
      return <p className="font-medium">{value.toString()}</p>;
    }
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      return (
        <div className="pl-3 mt-1 border-l-2 border-gray-200">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="mb-1">
              <p className="text-gray-500 text-xs">{k}:</p>
              {renderValue(v)}
            </div>
          ))}
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <p className="font-medium text-gray-400">Empty array</p>;
      }
      
      return (
        <div className="pl-3 mt-1 border-l-2 border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Array with {value.length} items:</p>
          {value.map((item, index) => (
            <div key={index} className="mb-1 pb-1 border-b border-gray-100">
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }
    
    // For dates, try to format them nicely
    if (typeof value === 'string' && 
        (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) || 
         value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/))) {
      try {
        const date = new Date(value);
        return <p className="font-medium">{date.toLocaleString()}</p>;
      } catch (e) {
        return <p className="font-medium">{value}</p>;
      }
    }
    
    // For URLs, make them clickable
    if (typeof value === 'string' && 
        (value.startsWith('http://') || value.startsWith('https://'))) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-medium text-blue-600 hover:underline"
        >
          {value}
        </a>
      );
    }
    
    // Default case for simple values
    return <p className="font-medium">{value.toString()}</p>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <ClipLoader color="#4caf50" size={60} />
        <p className="mt-4 text-gray-600">
          {retryCount > 0
            ? `Verifying your payment (Attempt ${retryCount}/${MAX_RETRIES})...`
            : "Verifying your payment..."}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          This may take a few moments while we confirm your transaction
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Issue</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-sm text-yellow-800">
              If you've completed the payment, don't worry! Your order may still be processing.
              Please check your orders page in a few minutes.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/orders" className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 transition duration-200">
              View My Orders
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Try Again
            </button>
            <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Organize payment data into categories
  const organizedPaymentData = paymentData ? organizePaymentData(paymentData) : {};

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        {paymentStatus === 'success' ? (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Status Pending'}
        </h2>
      </div>

      {/* Receipt Section */}
      <div id="receipt-to-print" ref={receiptRef} className="receipt-container border border-gray-200 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold">Payment Receipt</h3>
          <p className="text-sm text-gray-500">Transaction Reference: {tx_ref}</p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Payment Date:</p>
              <p className="font-medium">{receiptData?.paymentDate || new Date().toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Payment Method:</p>
              <p className="font-medium">{receiptData?.paymentMethod || 'Chapa'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Payment ID:</p>
              <p className="font-medium">{receiptData?.paymentId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Payment Status:</p>
              <p className={`font-medium ${paymentStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                {paymentStatus?.toUpperCase() || 'PENDING'}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        {receiptData?.customer && (
          <div className="mb-4">
            <h4 className="font-bold mb-2">Customer Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Name:</p>
                <p className="font-medium">{receiptData.customer.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email:</p>
                <p className="font-medium">{receiptData.customer.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Phone:</p>
                <p className="font-medium">{receiptData.customer.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {orderDetails && (
          <div className="mb-4">
            <h4 className="font-bold mb-2">Order Details</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">Order ID:</p>
                <p className="font-medium">{orderDetails.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Order Status:</p>
                <p className={`font-medium ${
                  orderDetails.status === 'confirmed' ? 'text-green-600' :
                  orderDetails.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {orderDetails.status?.toUpperCase() || 'PROCESSING'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        {receiptData?.orderDetails?.items && receiptData.orderDetails.items.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold mb-2">Order Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receiptData.orderDetails.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{item.price?.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{item.subtotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Amount */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Amount:</span>
            <span className="font-bold text-xl">
              {receiptData?.currency || 'ETB'} {receiptData?.amount || orderDetails?.total || 'N/A'}
            </span>
          </div>
        </div>

        {/* Organized Payment Data */}
        {paymentData && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="font-bold mb-2">Payment Data Details</h4>
            
            {/* Transaction Details */}
            {renderDataCategory('Transaction Details', organizedPaymentData.transactionDetails)}
            
            {/* Customer Information */}
            {renderDataCategory('Customer Information', organizedPaymentData.customerInfo)}
            
            {/* Order Information */}
            {renderDataCategory('Order Information', organizedPaymentData.orderInfo)}
            
            {/* Payment Provider Details */}
            {renderDataCategory('Payment Provider', organizedPaymentData.paymentProvider)}
            
            {/* Metadata */}
            {renderDataCategory('Metadata', organizedPaymentData.metadata)}
            
            {/* Other Information */}
            {renderDataCategory('Other Information', organizedPaymentData.other)}
          </div>
        )}

        {/* Receipt Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Thank you for your purchase!</p>
          <p className="mt-1">This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>

      {paymentStatus === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-sm text-green-800">
            Thank you for your purchase! Your payment has been successfully processed and your order is confirmed.
            You will receive an email confirmation shortly.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Your payment is being processed. This may take a few minutes to complete.
            You can check your order status on the orders page.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Receipt
        </button>
        <Link to="/orders" className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 transition duration-200 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          View My Orders
        </Link>
        <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default PaymentConfirmation;