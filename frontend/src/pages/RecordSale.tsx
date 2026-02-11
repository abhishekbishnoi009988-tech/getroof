import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RecordSale: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [saleAmount, setSaleAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const COMMISSION_RATE = 1.25; // 1.25%

  const calculateCommission = (amount: number) => {
    const totalCommission = Math.round((amount * COMMISSION_RATE) / 100);
    const brokerShare = Math.round(totalCommission * 0.45);
    const platformShare = Math.round(totalCommission * 0.55);
    return { totalCommission, brokerShare, platformShare };
  };

  const { totalCommission, brokerShare, platformShare } = saleAmount
    ? calculateCommission(Number(saleAmount))
    : { totalCommission: 0, brokerShare: 0, platformShare: 0 };

  const handleCreateOrder = async () => {
    if (!propertyType || !saleAmount || Number(saleAmount) <= 0) {
      toast.error('Please select property type and enter valid sale amount');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Creating payment order:', { propertyType, saleAmount: Number(saleAmount) });

      const response = await API.post('/payments/create-order', {
        propertyType,
        saleAmount: Number(saleAmount),
      });

      console.log('✅ Order created:', response.data);

      setOrderData(response.data.data);
      setShowQR(true);
      toast.success('Payment link generated! Show to buyer');
    } catch (error: any) {
      console.error('❌ Create order error:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxxxxx',
      amount: orderData.amount * 100, // Commission amount only
      currency: 'INR',
      name: 'GETROOF',
      description: `${COMMISSION_RATE}% Commission Payment`,
      order_id: orderData.orderId,
      handler: async function (response: any) {
        try {
          console.log('💳 Payment successful:', response);

          const verifyResponse = await API.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: orderData.paymentId,
            payerDetails: {
              name: 'Buyer',
              method: 'razorpay',
            },
          });

          console.log('✅ Payment verified:', verifyResponse.data);

          toast.success(`Commission received! You get ₹${orderData.brokerShare.toLocaleString()}`);
          navigate('/broker/payment-history');
        } catch (error) {
          console.error('❌ Verification failed:', error);
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: function() {
          toast.error('Payment cancelled');
          setShowQR(false);
          setOrderData(null);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Record Property Sale</h1>
              <p className="text-gray-600 mt-1">
                Enter sale details to receive your 45% commission
              </p>
            </div>
          </div>

          {!showQR ? (
            <div className="space-y-6">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Property Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPropertyType('residential')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      propertyType === 'residential'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">🏠</div>
                    <div className="font-semibold text-lg">Residential</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Houses, Apartments, Villas
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPropertyType('commercial')}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      propertyType === 'commercial'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">🏢</div>
                    <div className="font-semibold text-lg">Commercial</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Offices, Shops, Warehouses
                    </div>
                  </button>
                </div>
              </div>

              {/* Sale Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Sale Amount (₹) *
                </label>
                <input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  placeholder="50,00,000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the total price at which the property was sold
                </p>
              </div>

              {/* Commission Preview */}
              {saleAmount && Number(saleAmount) > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    💰 Commission Breakdown ({COMMISSION_RATE}% of Sale)
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
                      <div>
                        <span className="text-gray-700 font-medium">Property Sale Price:</span>
                        <p className="text-xs text-gray-500 mt-1">Actual sale value</p>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatAmount(Number(saleAmount))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white rounded-lg p-4">
                      <div>
                        <span className="text-gray-700 font-medium">
                          Total Commission ({COMMISSION_RATE}%):
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Amount to be paid by buyer
                        </p>
                      </div>
                      <span className="text-xl font-bold text-blue-600">
                        {formatAmount(totalCommission)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                      <div className="bg-green-100 rounded-lg p-4">
                        <p className="text-xs text-green-700 font-medium mb-1">
                          Your Share (45%)
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatAmount(brokerShare)}
                        </p>
                      </div>

                      <div className="bg-blue-100 rounded-lg p-4">
                        <p className="text-xs text-blue-700 font-medium mb-1">
                          Platform (55%)
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatAmount(platformShare)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">ℹ️ How it works:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Buyer pays only {COMMISSION_RATE}% commission (₹{totalCommission.toLocaleString()})</li>
                  <li>• Commission splits: 45% to you, 55% to platform</li>
                  <li>• You receive: ₹{brokerShare.toLocaleString()}</li>
                  <li>• Payment via Razorpay (UPI/Card/Netbanking)</li>
                </ul>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleCreateOrder}
                disabled={loading || !propertyType || !saleAmount || Number(saleAmount) <= 0}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  `Generate Payment QR (₹${formatAmount(totalCommission)})`
                )}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              {/* Success Header */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Link Ready!</h3>
                <p className="text-green-700">Show this to the buyer to complete the commission payment</p>
              </div>

              {/* Payment Details */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <h4 className="text-xl font-semibold mb-4">Commission Payment Details</h4>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Property Type:</span>
                    <span className="font-bold capitalize">{propertyType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Property Sale Price:</span>
                    <span className="font-bold">{formatAmount(orderData.saleAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Commission Rate:</span>
                    <span className="font-bold">{orderData.commissionRate}%</span>
                  </div>
                  <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg">
                    <span className="text-gray-700 font-semibold">Amount to Pay:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatAmount(orderData.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-green-50 px-4 rounded">
                    <span className="text-green-700">Your Commission (45%):</span>
                    <span className="font-bold text-green-600">
                      {formatAmount(orderData.brokerShare)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 bg-gray-50 px-4 rounded">
                    <span className="text-gray-600">Platform Fee (55%):</span>
                    <span className="font-bold text-gray-700">
                      {formatAmount(orderData.platformShare)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>💳</span>
                <span>Complete Payment (Buyer Clicks Here)</span>
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowQR(false);
                  setOrderData(null);
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default RecordSale;