import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Check, X, Eye, FileText } from 'lucide-react';

interface BrokerApplication {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  licenseNumber: string;
  yearsOfExperience: number;
  specialization: string;
  description: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [brokers, setBrokers] = useState<BrokerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedBroker, setSelectedBroker] = useState<BrokerApplication | null>(null);

  useEffect(() => {
    checkAdminAuth();
    fetchBrokers();
  }, [filter]);

  const checkAdminAuth = async () => {
    try {
      const response = await API.get('/auth/me');
      if (response.data.data.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        navigate('/');
      }
    } catch (error) {
      toast.error('Please login as admin');
      navigate('/login');
    }
  };

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/brokers');
      
      let filtered = response.data.data;
      if (filter !== 'all') {
        filtered = filtered.filter((b: BrokerApplication) => b.verificationStatus === filter);
      }
      
      setBrokers(filtered);
    } catch (error: any) {
      toast.error('Failed to load broker applications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (brokerId: string, status: 'verified' | 'rejected') => {
    try {
      const response = await API.put(`/admin/brokers/${brokerId}/verify`, {
        verificationStatus: status,
      });

      if (response.data.success) {
        toast.success(
          status === 'verified' 
            ? '✅ Broker approved successfully!' 
            : '❌ Broker application rejected'
        );
        fetchBrokers();
        setSelectedBroker(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Review and verify broker applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({brokers.filter(b => b.verificationStatus === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'verified'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Verified ({brokers.filter(b => b.verificationStatus === 'verified').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({brokers.filter(b => b.verificationStatus === 'rejected').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({brokers.length})
            </button>
          </div>
        </div>

        {/* Broker Applications List */}
        {brokers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {filter !== 'all' ? filter : ''} applications
            </h3>
            <p className="text-gray-500">
              {filter === 'pending' 
                ? 'No pending broker applications at the moment'
                : 'No applications found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {brokers.map((broker) => (
              <div key={broker._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{broker.user.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(broker.verificationStatus)}`}>
                        {broker.verificationStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📧 {broker.user.email}</p>
                      <p>📱 {broker.user.phone}</p>
                      <p>🆔 License: <span className="font-semibold">{broker.licenseNumber}</span></p>
                      <p>📅 Applied: {new Date(broker.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedBroker(selectedBroker?._id === broker._id ? null : broker)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{selectedBroker?._id === broker._id ? 'Hide' : 'View'} Details</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedBroker?._id === broker._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Experience</p>
                        <p className="text-lg">{broker.yearsOfExperience} years</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Specialization</p>
                        <p className="text-lg">{broker.specialization}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{broker.description}</p>
                    </div>

                    {/* Action Buttons */}
                    {broker.verificationStatus === 'pending' && (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleVerify(broker._id, 'verified')}
                          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center space-x-2"
                        >
                          <Check className="w-5 h-5" />
                          <span>Approve Broker</span>
                        </button>
                        <button
                          onClick={() => handleVerify(broker._id, 'rejected')}
                          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center space-x-2"
                        >
                          <X className="w-5 h-5" />
                          <span>Reject Application</span>
                        </button>
                      </div>
                    )}

                    {broker.verificationStatus === 'verified' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                        ✅ This broker has been verified and can now receive buyer notifications
                      </div>
                    )}

                    {broker.verificationStatus === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                        ❌ This application was rejected
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;