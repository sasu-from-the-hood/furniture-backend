import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { ClipLoader } from "react-spinners";
import { API_URL } from "../../config";

function TrackOrder() {
  const { orders, getOrders, loading, error } = useContext(ShopContext);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [paymentError, setPaymentError] = useState({});

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  // Function to handle payment
  const handlePayment = async (orderId) => {
    try {
      setPaymentLoading(prev => ({ ...prev, [orderId]: true }));
      setPaymentError(prev => ({ ...prev, [orderId]: null }));

      const response = await fetch(`${API_URL}/user/orders/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          paymentMethod: 'chapa'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      // Redirect to Chapa checkout page
      window.location.href = data.checkoutUrl;

    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(prev => ({ ...prev, [orderId]: err.message }));
    } finally {
      setPaymentLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    // Handle undefined or null status
    if (!status) return 'text-gray-500';

    switch(status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
        return 'text-blue-500';
      case 'processing':
        return 'text-orange-500';
      case 'shipped':
        return 'text-indigo-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Function to get payment status color
  const getPaymentStatusColor = (status) => {
    // Handle undefined or null status
    if (!status) return 'text-gray-500';

    switch(status.toLowerCase()) {
      case 'paid':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#4caf50" size={60} />
      </div>
    );

  if (error) return (
    <div className="p-4 bg-red-100 text-red-700 rounded-md">
      <p>Error: {error}</p>
    </div>
  );

  return (
    <>
      <section className="mt-4 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-extralight mb-6">
          MY <span className="text-green-950 font-bold">ORDERS</span>
        </h1>

        {orders.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <h1 className="text-xl text-gray-500">No Orders Yet</h1>
            <p className="mt-2 text-gray-400">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
              >
                <div className="flex flex-wrap justify-between items-start mb-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID: <span className="font-medium">{order.id}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex space-x-2 mb-2">
                      <p className="text-sm text-gray-500">Status:</p>
                      <span className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status ? order.status.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <p className="text-sm text-gray-500">Payment:</p>
                      <span className={`text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.products && order.products.map((product) => {
                    const orderDetails = product.orderDetails || {};
                    return (
                      <div
                        key={product.id}
                        className="flex items-center space-x-4 border-t pt-4"
                      >
                        <div className="flex-1">
                          <h1 className="text-lg font-semibold">
                            {product.title}
                          </h1>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {product.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {orderDetails.quantity}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-green-950">
                          {orderDetails.unitPrice} ETB
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap  justify-between items-center">
                  <div className="text-right  flex-grow">
                    <p className="text-lg mr-24 font-semibold">
                      Total: {order.total} ETB
                    </p>
                  </div>

                  {(order.paymentStatus === 'pending' || !order.paymentStatus) && (
                    <div className="mt-4 w-full sm:w-auto sm:mt-0">
                      {paymentError[order.id] && (
                        <p className="text-red-500 text-sm mb-2">{paymentError[order.id]}</p>
                      )}
                      <button
                        onClick={() => handlePayment(order.id)}
                        disabled={paymentLoading[order.id]}
                        className="w-full sm:w-auto bg-green-800 hover:bg-green-900 text-white font-medium py-2 px-6 rounded-md transition duration-200 flex items-center justify-center"
                      >
                        {paymentLoading[order.id] ? (
                          <>
                            <ClipLoader color="#ffffff" size={16} className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Complete Payment'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default TrackOrder;
