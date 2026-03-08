import React, { useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

interface SoldPaymentModalProps {
  notification: {
    _id: string;
    property: {
      _id: string;
      title: string;
      price: number;
    };
    buyerName: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const SoldPaymentModal: React.FC<SoldPaymentModalProps> = ({ notification, onClose, onSuccess }) => {
  const [saleAmount, setSaleAmount] = useState('');
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [step, setStep] = useState<'input' | 'qr'>('input');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    qrCode: string;
    totalCommission: number;
    brokerShare: number;
    platformShare: number;
    paymentId: string;
    cfOrderId: string;
  } | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Updated: 1.49% commission, 70% broker / 30% platform
  const commission = saleAmount ? Math.round((parseFloat(saleAmount) * 1.49) / 100) : 0;
  const brokerShare = Math.round(commission * 0.70);
  const platformShare = Math.round(commission * 0.30);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const handleGenerateQR = async () => {
    if (!saleAmount || parseFloat(saleAmount) <= 0) {
      toast.error('Please enter a valid sale amount');
      return;
    }
    setLoading(true);
    try {
      const response = await API.post('/payments/create-qr', {
        propertyType,
        saleAmount: parseFloat(saleAmount),
        notificationId: notification._id,
        propertyId: notification.property._id,
      });
      setQrData(response.data.data);
      setStep('qr');
      toast.success('QR Code generated! Show to seller to scan and pay.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!qrData) return;
    setCheckingPayment(true);
    try {
      const response = await API.post('/payments/check-qr-payment', {
        paymentId: qrData.paymentId,
        cfOrderId: qrData.cfOrderId,
      });
      if (response.data.data.paid) {
        toast.success('Payment received! Property marked as sold. 🎉');
        onSuccess();
        onClose();
      } else {
        toast.error('Payment not received yet. Please ask seller to scan and pay.');
      }
    } catch (error) {
      toast.error('Failed to check payment status');
    } finally {
      setCheckingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-green-600 text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">🏠 Mark Property as Sold</h2>
            <p className="text-green-100 text-sm mt-1">{notification.property.title}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-green-200 text-2xl font-bold">×</button>
        </div>

        <div className="p-5">
          {step === 'input' && (
            <>
              {/* Property Type */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPropertyType('residential')}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      propertyType === 'residential'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    🏠 Residential
                  </button>
                  <button
                    onClick={() => setPropertyType('commercial')}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      propertyType === 'commercial'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    🏢 Commercial
                  </button>
                </div>
              </div>

              {/* Sale Amount */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Sale Amount (₹)
                </label>
                <input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  placeholder="e.g. 5000000"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg focus:border-green-500 outline-none"
                />
              </div>

              {/* Commission Breakdown */}
              {saleAmount && parseFloat(saleAmount) > 0 && (
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-green-800 mb-3">💰 Commission Breakdown (1.49%)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sale Price:</span>
                      <span className="font-bold">{formatPrice(parseFloat(saleAmount))}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Commission (1.49%):</span>
                      <span className="font-bold text-green-700">{formatPrice(commission)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Your Share (70%)</p>
                        <p className="font-bold text-green-600">{formatPrice(brokerShare)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500">Platform (30%)</p>
                        <p className="font-bold text-blue-600">{formatPrice(platformShare)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm text-blue-700">
                📱 A QR code will be generated for <strong>{formatPrice(commission)}</strong>.
                Show it to the seller to scan and pay via UPI/Card.
              </div>

              <button
                onClick={handleGenerateQR}
                disabled={loading || !saleAmount || parseFloat(saleAmount) <= 0}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Generating QR...' : `Generate Payment QR (${formatPrice(commission)})`}
              </button>
            </>
          )}

          {step === 'qr' && qrData && (
            <div className="text-center">
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-green-800 font-semibold mb-1">Commission Amount</p>
                <p className="text-3xl font-bold text-green-600">{formatPrice(qrData.totalCommission)}</p>
                <p className="text-sm text-gray-500 mt-1">Ask seller to scan and pay</p>
              </div>

              {/* QR Code */}
              <div className="border-4 border-green-500 rounded-2xl p-4 mb-4 inline-block">
                <img
                  src={qrData.qrCode}
                  alt="Payment QR Code"
                  className="w-56 h-56 mx-auto"
                />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Seller can pay via any UPI app — PhonePe, GPay, Paytm etc.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Your Earnings (70%)</p>
                  <p className="font-bold text-green-600">{formatPrice(qrData.brokerShare)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Platform Fee (30%)</p>
                  <p className="font-bold text-blue-600">{formatPrice(qrData.platformShare)}</p>
                </div>
              </div>

              <button
                onClick={handleCheckPayment}
                disabled={checkingPayment}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 mb-3"
              >
                {checkingPayment ? '⏳ Checking...' : '✅ Payment Done? Verify Now'}
              </button>

              <button
                onClick={() => setStep('input')}
                className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoldPaymentModal;