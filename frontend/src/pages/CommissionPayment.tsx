import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CommissionPayment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    saleAmount: 0,
    paymentMethod: 'upi' as 'upi' | 'cash',
    transactionId: '',
  });

  const commission = formData.saleAmount * 0.01;
  const brokerShare = commission * 0.45;
  const companyShare = commission * 0.55;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/v1/payments/commission',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('✅ Commission payment recorded successfully!');
        navigate('/broker/notifications');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commission Payment
          </h1>
          <p className="text-gray-600 mb-8">
            Record commission payment after successful property sale
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sale Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Final Sale Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.saleAmount}
                onChange={(e) =>
                  setFormData({ ...formData, saleAmount: Number(e.target.value) })
                }
                placeholder="5000000"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Property ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Property ID *
              </label>
              <input
                type="text"
                required
                value={formData.propertyId}
                onChange={(e) =>
                  setFormData({ ...formData, propertyId: e.target.value })
                }
                placeholder="Enter property ID"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            {/* Commission Breakdown */}
            {formData.saleAmount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Commission Breakdown
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Commission (1%)</span>
                    <span className="font-semibold text-gray-900">
                      ₹{commission.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Your Share (45%)</span>
                      <span className="font-bold text-green-600 text-lg">
                        ₹{brokerShare.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">GETROOF Share (55%)</span>
                      <span className="font-semibold text-blue-600">
                        ₹{companyShare.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                  className={`p-4 border-2 rounded-lg ${
                    formData.paymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  UPI / QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                  className={`p-4 border-2 rounded-lg ${
                    formData.paymentMethod === 'cash'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  Cash
                </button>
              </div>
            </div>

            {/* Transaction ID */}
            {formData.paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                  placeholder="Enter UPI transaction ID"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionPayment;