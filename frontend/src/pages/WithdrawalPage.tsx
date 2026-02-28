import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import API from '../services/api';
import toast from 'react-hot-toast';

const WithdrawalPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingMethod, setSavingMethod] = useState(false);
  const [balance, setBalance] = useState({ totalEarned: 0, totalWithdrawn: 0, availableBalance: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'withdraw' | 'method' | 'history'>('withdraw');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [methodType, setMethodType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '', accountNumber: '', ifscCode: '', bankName: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [balRes, methodRes] = await Promise.all([
        API.get('/withdrawals/my'),
        API.get('/withdrawals/payment-method'),
      ]);
      if (balRes.data.success) {
        setBalance(balRes.data.data);
        setWithdrawals(balRes.data.data.withdrawals);
      }
      if (methodRes.data.success && methodRes.data.data) {
        setPaymentMethod(methodRes.data.data);
        setMethodType(methodRes.data.data.paymentMethod);
        if (methodRes.data.data.upiId) setUpiId(methodRes.data.data.upiId);
        if (methodRes.data.data.bankDetails) setBankDetails(methodRes.data.data.bankDetails);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMethod = async () => {
    setSavingMethod(true);
    try {
      const payload: any = { paymentMethod: methodType };
      if (methodType === 'upi') {
        if (!upiId) { toast.error('Please enter UPI ID'); return; }
        payload.upiId = upiId;
      } else {
        if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
          toast.error('Please fill all bank details'); return;
        }
        payload.bankDetails = bankDetails;
      }
      const res = await API.post('/withdrawals/payment-method', payload);
      if (res.data.success) {
        toast.success('Payment method saved!');
        setPaymentMethod(res.data.data);
        setActiveTab('withdraw');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSavingMethod(false);
    }
  };

  const handleWithdraw = async () => {
    if (!paymentMethod) { toast.error('Please add a payment method first'); setActiveTab('method'); return; }
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100) { toast.error('Minimum withdrawal is ₹100'); return; }
    if (amount > balance.availableBalance) { toast.error('Insufficient balance'); return; }
    setSubmitting(true);
    try {
      const res = await API.post('/withdrawals/request', { amount });
      if (res.data.success) {
        toast.success('Withdrawal request submitted! Admin will process it soon.');
        setWithdrawAmount('');
        fetchData();
        setActiveTab('history');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">💸 Withdrawal</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-600 text-white rounded-xl p-6">
            <p className="text-sm opacity-80">Total Earned</p>
            <p className="text-3xl font-bold mt-1">₹{balance.totalEarned.toLocaleString()}</p>
          </div>
          <div className="bg-blue-600 text-white rounded-xl p-6">
            <p className="text-sm opacity-80">Available Balance</p>
            <p className="text-3xl font-bold mt-1">₹{balance.availableBalance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-600 text-white rounded-xl p-6">
            <p className="text-sm opacity-80">Total Withdrawn</p>
            <p className="text-3xl font-bold mt-1">₹{balance.totalWithdrawn.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-xl p-1 mb-6">
          {[['withdraw', '💰 Withdraw'], ['method', '🏦 Payment Method'], ['history', '📋 History']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
            {!paymentMethod && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium">⚠️ No payment method added yet!</p>
                <button onClick={() => setActiveTab('method')} className="mt-2 text-blue-600 font-semibold underline text-sm">Add Payment Method →</button>
              </div>
            )}
            {paymentMethod && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium">Payment to: {paymentMethod.paymentMethod === 'upi' ? `UPI - ${paymentMethod.upiId}` : `Bank - ${paymentMethod.bankDetails?.bankName} (${paymentMethod.bankDetails?.accountNumber?.slice(-4).padStart(paymentMethod.bankDetails?.accountNumber?.length, '*')})`}</p>
                <button onClick={() => setActiveTab('method')} className="text-xs text-blue-600 underline mt-1">Change →</button>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
              <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount (min ₹100)" min={100} max={balance.availableBalance}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xl font-bold focus:outline-none focus:border-blue-500" />
              <p className="text-sm text-gray-500 mt-1">Available: ₹{balance.availableBalance.toLocaleString()}</p>
            </div>
            <div className="flex space-x-2 mb-4">
              {[500, 1000, 2000, 5000].map(amt => (
                <button key={amt} onClick={() => setWithdrawAmount(String(Math.min(amt, balance.availableBalance)))}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-blue-500 hover:text-blue-600">
                  ₹{amt}
                </button>
              ))}
            </div>
            <button onClick={handleWithdraw} disabled={submitting || !paymentMethod}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {submitting ? 'Submitting...' : 'Request Withdrawal'}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">Admin will process your request within 24-48 hours</p>
          </div>
        )}

        {/* Payment Method Tab */}
        {activeTab === 'method' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="flex space-x-4 mb-6">
              <button onClick={() => setMethodType('upi')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${methodType === 'upi' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                📱 UPI
              </button>
              <button onClick={() => setMethodType('bank')}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${methodType === 'bank' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                🏦 Bank Account
              </button>
            </div>

            {methodType === 'upi' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
                <p className="text-xs text-gray-500 mt-1">Example: 9876543210@paytm or name@gpay</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <input type="text" value={bankDetails.accountHolderName} onChange={e => setBankDetails(p => ({ ...p, accountHolderName: e.target.value }))}
                    placeholder="Full name as on bank account" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input type="text" value={bankDetails.accountNumber} onChange={e => setBankDetails(p => ({ ...p, accountNumber: e.target.value }))}
                    placeholder="Enter account number" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input type="text" value={bankDetails.ifscCode} onChange={e => setBankDetails(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                    placeholder="SBIN0001234" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input type="text" value={bankDetails.bankName} onChange={e => setBankDetails(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="State Bank of India" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            )}

            <button onClick={handleSaveMethod} disabled={savingMethod}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-400">
              {savingMethod ? 'Saving...' : '✅ Save Payment Method'}
            </button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Withdrawal History</h2>
            {withdrawals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-5xl mb-3">💸</p>
                <p className="text-lg font-medium">No withdrawals yet</p>
                <p className="text-sm">Your withdrawal requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((w: any) => (
                  <div key={w._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xl font-bold text-gray-900">₹{w.amount.toLocaleString()}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(w.status)}`}>{w.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">{w.paymentMethod === 'upi' ? `UPI: ${w.upiId}` : `Bank: ${w.bankDetails?.bankName}`}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(w.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {w.adminNote && <p className="text-xs text-red-600 mt-2 bg-red-50 rounded p-2">Admin note: {w.adminNote}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalPage;