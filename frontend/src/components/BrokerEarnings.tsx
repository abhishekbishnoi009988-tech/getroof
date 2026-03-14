import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const BrokerEarnings: React.FC = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await API.get('/payments/broker-history');
      setEarnings(response.data.data.totalEarnings || 0);
      setPendingPayments(response.data.data.pendingPayments || 0);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
      <h3 className="text-lg font-semibold mb-2">Your Earnings</h3>
      <p className="text-4xl font-bold mb-4">₹{earnings.toLocaleString()}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">70% commission from sales</p>
          {pendingPayments > 0 && (
            <p className="text-xs opacity-75 mt-1">{pendingPayments} pending payments</p>
          )}
        </div>
        <button
          onClick={() => navigate('/broker/record-sale')}
          className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold text-sm"
        >
          Record Sale
        </button>
      </div>
    </div>
  );
};

export default BrokerEarnings;