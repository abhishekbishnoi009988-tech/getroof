import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import SoldPaymentModal from '../components/SoldPaymentModal';

interface Notification {
  _id: string;
  property: {
    _id: string;
    title: string;
    price: number;
    address: {
      street: string;
      city: string;
      state: string;
    };
    images: string[];
  };
  buyerName: string;
  buyerPhone: string;
  message: string;
  status: string;
  createdAt: string;
}

const BrokerNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted'>('all');
  const [soldModal, setSoldModal] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/broker-notifications');
      setNotifications(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsContacted = async (notificationId: string) => {
    try {
      await API.patch(`/broker-notifications/${notificationId}`, { status: 'contacted' });
      toast.success('Marked as contacted');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Notifications</h1>
          <p className="text-gray-600">Buyers interested in properties near your area</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex space-x-2">
          {(['all', 'pending', 'contacted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? `All (${notifications.length})` : 
               f === 'pending' ? `Pending (${notifications.filter(n => n.status === 'pending').length})` :
               `Contacted (${notifications.filter(n => n.status === 'contacted').length})`}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} notifications
            </h3>
            <p className="text-gray-600">New buyer interests will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div key={notification._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Property Image */}
                  <div className="md:w-48 h-48 md:h-auto bg-gray-200">
                    {notification.property?.images && notification.property.images.length > 0 ? (
                      <img src={notification.property.images[0]} alt={notification.property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {notification.property?.title || 'Property'}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600 mb-2">
                          {formatPrice(notification.property?.price || 0)}
                        </p>
                        <p className="text-gray-600 text-sm mb-3">
                          {notification.property?.address?.city}, {notification.property?.address?.state}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {notification.status === 'pending' ? 'Pending' : 'Contacted'}
                      </span>
                    </div>

                    {/* Buyer Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-3">Buyer Information:</h4>
                      <div className="space-y-2">
                        <p className="text-gray-700"><strong>Name:</strong> {notification.buyerName || 'Anonymous'}</p>
                        <p className="text-gray-700">
                          <strong>Phone:</strong>{' '}
                          <a href={`tel:${notification.buyerPhone}`} className="text-blue-600 hover:underline">
                            {notification.buyerPhone}
                          </a>
                        </p>
                        <p className="text-gray-700"><strong>Date:</strong> {formatDate(notification.createdAt)}</p>
                        {notification.message && (
                          <p className="text-gray-700"><strong>Message:</strong> {notification.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`tel:${notification.buyerPhone}`}
                        className="flex-1 min-w-[120px] bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-semibold text-center"
                      >
                        📞 Call Buyer
                      </a>
                      <button
                        onClick={() => navigate(`/property/${notification.property._id}`)}
                        className="flex-1 min-w-[120px] bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        View Property
                      </button>

                      {/* MARK AS SOLD BUTTON */}
                      <button
                        onClick={() => setSoldModal(notification)}
                        className="flex-1 min-w-[120px] bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 font-semibold"
                      >
                        🏷️ Mark as Sold
                      </button>

                      {notification.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsContacted(notification._id)}
                          className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Mark Contacted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sold Payment Modal */}
      {soldModal && (
        <SoldPaymentModal
          notification={soldModal}
          onClose={() => setSoldModal(null)}
          onSuccess={() => {
            setSoldModal(null);
            fetchNotifications();
          }}
        />
      )}
    </div>
  );
};

export default BrokerNotifications;