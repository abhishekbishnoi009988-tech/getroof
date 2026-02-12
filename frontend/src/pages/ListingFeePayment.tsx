import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Property {
  _id: string;
  title: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
  };
  images: string[];
}

const ListingFeePayment: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setProperty(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      alert('Property not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'upi' && !transactionId) {
      alert('Please enter UPI transaction ID');
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/payments/listing-fee`,
        {
          propertyId,
          paymentMethod,
          transactionId: transactionId || 'RAZORPAY_' + Date.now(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('✅ Payment successful! Your property is now live.');
        navigate('/my-properties');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Property not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Property Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Property Listing Payment
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {property.images[0] && (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full sm:w-48 h-32 object-cover rounded-lg"
              />
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {property.title}
              </h3>
              <p className="mt-1 text-gray-600">
                {property.address.street}, {property.address.city}, {property.address.state}
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                ₹{property.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Payment Details
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Listing Fee</span>
              <span className="text-2xl font-bold text-blue-600">₹600</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              One-time payment to activate your property listing
            </p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span className="font-medium">Card / UPI / Net Banking</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  <span className="font-medium">UPI / QR Code</span>
                </div>
              </button>
            </div>

            {/* UPI Transaction ID Input */}
            {paymentMethod === 'upi' && (
              <div className="mt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    📱 <strong>Pay via UPI:</strong> getroof@paytm (or scan QR code)
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    After payment, enter your UPI transaction ID below
                  </p>
                </div>
                
                <label className="block text-sm font-medium text-gray-700">
                  UPI Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                   placeholder="e.g., 123456789012"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>

    {/* Terms and Conditions */}
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Terms & Conditions
      </h3>
      <ul className="space-y-2 text-sm text-gray-600">
        <li className="flex items-start">
          <svg
            className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Your property will be live immediately after payment confirmation
        </li>
        <li className="flex items-start">
          <svg
            className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          ₹600 is a one-time non-refundable listing fee
        </li>
        <li className="flex items-start">
          <svg
            className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          After sale, broker will charge 1% commission (45% broker, 55% GETROOF)
        </li>
      </ul>
    </div>

    {/* Payment Button */}
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
      >
        Cancel
      </button>
      <button
        onClick={handlePayment}
        disabled={processing}
        className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
      >
        {processing ? 'Processing...' : 'Pay ₹600 & Activate Listing'}
      </button>
    </div>
  </div>
</div>
);
};
export default ListingFeePayment;
