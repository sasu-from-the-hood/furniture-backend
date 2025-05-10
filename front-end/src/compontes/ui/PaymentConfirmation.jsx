import { useEffect, useState } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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

        setPaymentStatus(data.status);

        // If we have order details from the verification response, use them
        if (data.order) {
          setOrderDetails(data.order);
        }
        // Otherwise fetch order details separately
        else if (data.order?.id) {
          const orderResponse = await fetch(`${API_URL}/user/orders/${data.order.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          const orderData = await orderResponse.json();

          if (!orderResponse.ok) {
            console.warn('Failed to fetch additional order details:', orderData.message);
            // Still use the basic order info we have
            setOrderDetails(data.order);
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

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
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

        {orderDetails && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-left">
              <p className="text-gray-500 font-medium">Order ID:</p>
              <p className="text-gray-800">{orderDetails.id}</p>

              {orderDetails.total && (
                <>
                  <p className="text-gray-500 font-medium">Amount:</p>
                  <p className="text-gray-800 font-semibold">{orderDetails.total} ETB</p>
                </>
              )}

              <p className="text-gray-500 font-medium">Order Status:</p>
              <p className={`font-semibold ${
                orderDetails.status === 'confirmed' ? 'text-green-600' :
                orderDetails.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {orderDetails.status?.toUpperCase() || 'PROCESSING'}
              </p>

              <p className="text-gray-500 font-medium">Payment Status:</p>
              <p className={`font-semibold ${
                orderDetails.paymentStatus === 'paid' ? 'text-green-600' :
                orderDetails.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {orderDetails.paymentStatus?.toUpperCase() || 'PENDING'}
              </p>
            </div>
          </div>
        )}

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

        <div className="flex flex-col space-y-2">
          <Link to="/orders" className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900 transition duration-200">
            View My Orders
          </Link>
          <Link to="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmation;
