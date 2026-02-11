import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import BrokerEarnings from '../components/BrokerEarnings';
import Footer from '../components/Layout/Footer';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Welcome to GetRoof</h1>

        {/* Show earnings widget for brokers */}
        {user?.role === 'broker' && (
          <div className="mb-8">
            <BrokerEarnings />
         </div>
       )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Buy Card */}
<div 
  onClick={() => navigate('/properties?type=buy')}
  className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
>
  <div className="text-5xl mb-4">🏠</div>
  <h2 className="text-2xl font-bold mb-2">Buy</h2>
  <p className="text-gray-600">Search properties by PIN code</p>
</div>

{/* Rent Card */}
<div 
  onClick={() => navigate('/properties?type=rent')}
  className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
>
  <div className="text-5xl mb-4">🔑</div>
  <h2 className="text-2xl font-bold mb-2">Rent</h2>
  <p className="text-gray-600">Search rentals by PIN code</p>
</div>

          {/* Sell Card */}
          <div 
            onClick={() => navigate('/upload-house')}
            className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="text-5xl mb-4">💰</div>
            <h2 className="text-2xl font-bold mb-2">Sell</h2>
            <p className="text-gray-600">Upload your property</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/my-properties')}
              className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 text-left"
            >
              <div className="font-semibold text-lg">My Properties</div>
              <div className="text-sm opacity-90">View your listings</div>
            </button>
            
            {/* Show this button ONLY if user is a broker */}
            {user?.role === 'broker' ? (
              <>
                <button
                  onClick={() => navigate('/broker/record-sale')}
                  className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 font-semibold flex items-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Record Sale & Get Paid</div>
                    <div className="text-sm opacity-90">Receive your 45% commission</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/broker/payment-history')}
                  className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 text-left"
                >
                  <div className="font-semibold text-lg">💰 Payment History</div>
                  <div className="text-sm opacity-90">View your earnings</div>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/become-broker')}
                className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 text-left"
              >
                <div className="font-semibold text-lg">Become a Broker</div>
                <div className="text-sm opacity-90">Start earning commissions</div>
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;