import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Check, X, Eye, FileText } from 'lucide-react';

interface BrokerApplication {
  _id: string;
  user: { _id: string; name: string; email: string; phone: string; };
  licenseNumber: string;
  yearsOfExperience: number;
  specialization: string;
  description: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

interface Withdrawal {
  _id: string;
  broker: { user: { name: string; email: string } };
  amount: number;
  paymentMethod: 'upi' | 'bank';
  upiId?: string;
  bankDetails?: { accountHolderName: string; accountNumber: string; ifscCode: string; bankName: string };
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  adminNote?: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'brokers' | 'withdrawals'>('brokers');
  
  // Broker state
  const [brokers, setBrokers] = useState<BrokerApplication[]>([]);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [selectedBroker, setSelectedBroker] = useState<BrokerApplication | null>(null);

  // Withdrawal state
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [wFilter, setWFilter] = useState('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    checkAdminAuth();
    fetchBrokers();
    fetchWithdrawals();
  }, [filter]);

  const checkAdminAuth = async () => {
    try {
      const response = await API.get('/auth/me');
      if (response.data.data.role !== 'admin') { toast.error('Access denied. Admin only.'); navigate('/'); }
    } catch (error) { toast.error('Please login as admin'); navigate('/login'); }
  };

  const fetchBrokers = async () => {
    try {
      setLoadingBrokers(true);
      const response = await API.get('/admin/brokers');
      let filtered = response.data.data;
      if (filter !== 'all') filtered = filtered.filter((b: BrokerApplication) => b.verificationStatus === filter);
      setBrokers(filtered);
    } catch (error: any) { toast.error('Failed to load broker applications'); }
    finally { setLoadingBrokers(false); }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoadingWithdrawals(true);
      const res = await API.get('/withdrawals/admin/all');
      if (res.data.success) setWithdrawals(res.data.data);
    } catch (error) { console.error('Failed to fetch withdrawals'); }
    finally { setLoadingWithdrawals(false); }
  };

  const handleVerify = async (brokerId: string, status: 'verified' | 'rejected') => {
    try {
      const response = await API.put(`/admin/brokers/${brokerId}/verify`, { verificationStatus: status });
      if (response.data.success) {
        toast.success(status === 'verified' ? '✅ Broker approved!' : '❌ Broker rejected');
        fetchBrokers();
        setSelectedBroker(null);
      }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to update status'); }
  };

  const handleWithdrawalUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await API.put(`/withdrawals/admin/${id}`, { status, adminNote: adminNote[id] || '' });
      if (res.data.success) { toast.success(`Withdrawal ${status}!`); fetchWithdrawals(); }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to update'); }
    finally { setUpdatingId(null); }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const filteredWithdrawals = wFilter === 'all' ? withdrawals : withdrawals.filter(w => w.status === wFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage brokers and withdrawals</p>
        </div>

        {/* Section Toggle */}
        <div className="flex space-x-4 mb-8">
          <button onClick={() => setActiveSection('brokers')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'brokers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
            👥 Broker Applications
          </button>
          <button onClick={() => setActiveSection('withdrawals')}
            className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === 'withdrawals' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}>
            💸 Withdrawals
            {pendingWithdrawals.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>
        </div>

        {/* BROKERS SECTION */}
        {activeSection === 'brokers' && (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex space-x-2">
                {(['pending', 'verified', 'rejected', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${filter === f ? f === 'pending' ? 'bg-yellow-500 text-white' : f === 'verified' ? 'bg-green-500 text-white' : f === 'rejected' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {f} ({brokers.filter(b => f === 'all' ? true : b.verificationStatus === f).length})
                  </button>
                ))}
              </div>
            </div>

            {loadingBrokers ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
            ) : brokers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No {filter !== 'all' ? filter : ''} applications</h3>
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
                      <button onClick={() => setSelectedBroker(selectedBroker?._id === broker._id ? null : broker)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>{selectedBroker?._id === broker._id ? 'Hide' : 'View'} Details</span>
                      </button>
                    </div>

                    {selectedBroker?._id === broker._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div><p className="text-sm font-semibold text-gray-700 mb-1">Experience</p><p className="text-lg">{broker.yearsOfExperience} years</p></div>
                          <div><p className="text-sm font-semibold text-gray-700 mb-1">Specialization</p><p className="text-lg">{broker.specialization}</p></div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{broker.description}</p>
                        </div>
                        {broker.verificationStatus === 'pending' && (
                          <div className="flex space-x-4">
                            <button onClick={() => handleVerify(broker._id, 'verified')}
                              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center space-x-2">
                              <Check className="w-5 h-5" /><span>Approve Broker</span>
                            </button>
                            <button onClick={() => handleVerify(broker._id, 'rejected')}
                              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center space-x-2">
                              <X className="w-5 h-5" /><span>Reject Application</span>
                            </button>
                          </div>
                        )}
                        {broker.verificationStatus === 'verified' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">✅ This broker has been verified</div>
                        )}
                        {broker.verificationStatus === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">❌ This application was rejected</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* WITHDRAWALS SECTION */}
        {activeSection === 'withdrawals' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-700 font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-800">{pendingWithdrawals.length}</p>
                <p className="text-sm text-yellow-600">₹{pendingWithdrawals.reduce((s, w) => s + w.amount, 0).toLocaleString()} total</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium">Paid Out</p>
                <p className="text-3xl font-bold text-green-800">{withdrawals.filter(w => w.status === 'paid').length}</p>
                <p className="text-sm text-green-600">₹{withdrawals.filter(w => w.status === 'paid').reduce((s, w) => s + w.amount, 0).toLocaleString()} total</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-blue-800">{withdrawals.length}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex space-x-2 mb-6 flex-wrap gap-2">
              {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
                <button key={f} onClick={() => setWFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${wFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                  {f} ({(f === 'all' ? withdrawals : withdrawals.filter(w => w.status === f)).length})
                </button>
              ))}
            </div>

            {loadingWithdrawals ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>
            ) : filteredWithdrawals.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                <p className="text-5xl mb-3">💸</p>
                <p className="text-lg font-medium">No withdrawal requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWithdrawals.map((w: Withdrawal) => (
                  <div key={w._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">₹{w.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">{new Date(w.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(w.status)}`}>{w.status}</span>
                    </div>

                    {/* Broker Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-bold text-gray-700 mb-1">👤 Broker</p>
                      <p className="text-sm text-gray-600">Name: {w.broker?.user?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Email: {w.broker?.user?.email || 'N/A'}</p>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-bold text-blue-700 mb-1">💳 Payment To</p>
                      {w.paymentMethod === 'upi' ? (
                        <p className="text-sm text-blue-800">📱 UPI: <span className="font-bold">{w.upiId}</span></p>
                      ) : (
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>🏦 Bank: <span className="font-bold">{w.bankDetails?.bankName}</span></p>
                          <p>👤 Name: <span className="font-bold">{w.bankDetails?.accountHolderName}</span></p>
                          <p>🔢 Account: <span className="font-bold">{w.bankDetails?.accountNumber}</span></p>
                          <p>🏷️ IFSC: <span className="font-bold">{w.bankDetails?.ifscCode}</span></p>
                        </div>
                      )}
                    </div>

                    {/* Admin Note Input */}
                    {w.status === 'pending' && (
                      <div className="mb-4">
                        <input type="text" placeholder="Add note (optional)" value={adminNote[w._id] || ''}
                          onChange={e => setAdminNote(p => ({ ...p, [w._id]: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                    )}

                    {w.adminNote && <p className="text-xs text-gray-600 bg-gray-100 rounded p-2 mb-4">Note: {w.adminNote}</p>}

                    {/* Action Buttons */}
                    {w.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button onClick={() => handleWithdrawalUpdate(w._id, 'approved')} disabled={updatingId === w._id}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm">
                          ✅ Approve
                        </button>
                        <button onClick={() => handleWithdrawalUpdate(w._id, 'rejected')} disabled={updatingId === w._id}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 text-sm">
                          ❌ Reject
                        </button>
                      </div>
                    )}
                    {w.status === 'approved' && (
                      <button onClick={() => handleWithdrawalUpdate(w._id, 'paid')} disabled={updatingId === w._id}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 text-sm">
                        💚 Mark as Paid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;