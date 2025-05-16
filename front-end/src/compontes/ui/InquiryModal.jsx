import { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import axiosInstance from '../../hooks/axiosInstance';
import { ShopContext } from '../context/ShopContext';
import { FaTimes } from 'react-icons/fa';

const InquiryModal = ({ isOpen = false, onClose, productId, productName }) => {
  const { token } = useContext(ShopContext);
  const [message, setMessage] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log props for debugging
  useEffect(() => {
    console.log('InquiryModal props:', { isOpen, productId, productName });
  }, [isOpen, productId, productName]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  console.log('Rendering modal with props:', { isOpen, productId, productName });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Please log in to submit an inquiry');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/user/inquiries', {
        productId,
        message,
        preferredContactMethod
      });

      if (response.status === 201) {
        toast.success('Inquiry submitted successfully!');
        setMessage('');
        onClose();
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit inquiry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden border-2 border-green-900">
        {/* Header */}
        <div className="bg-green-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Product Inquiry</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800">Product: {productName}</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                Your Message*
              </label>
              <textarea
                id="message"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="5"
                placeholder="Enter your questions or inquiries about this product..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Preferred Contact Method
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-600"
                    name="contactMethod"
                    value="email"
                    checked={preferredContactMethod === 'email'}
                    onChange={() => setPreferredContactMethod('email')}
                  />
                  <span className="ml-2">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-600"
                    name="contactMethod"
                    value="phone"
                    checked={preferredContactMethod === 'phone'}
                    onChange={() => setPreferredContactMethod('phone')}
                  />
                  <span className="ml-2">Phone</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-600"
                    name="contactMethod"
                    value="both"
                    checked={preferredContactMethod === 'both'}
                    onChange={() => setPreferredContactMethod('both')}
                  />
                  <span className="ml-2">Both</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md mr-2 hover:bg-gray-100"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-900 text-white rounded-md hover:bg-green-800 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

InquiryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  productName: PropTypes.string.isRequired
};

export default InquiryModal;
