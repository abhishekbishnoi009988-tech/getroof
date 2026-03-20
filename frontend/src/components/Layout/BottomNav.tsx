import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Key, PlusSquare, Bell, User,
  Building2, LogOut, CreditCard, Wallet,
  ChevronRight, UserCheck, X, Phone, Bookmark
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

interface BottomNavProps {
  user: any;
}

const BottomNav: React.FC<BottomNavProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showSupportSheet, setShowSupportSheet] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('getroof_user');
    toast.success('Logged out successfully');
    navigate('/login');
    setShowAccountSheet(false);
  };

  const handleCallbackRequest = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    setSubmitting(true);
    try {
      const response = await API.post('/support/callback', { phone });
      if (response.data.success) {
        toast.success('Callback requested! Our team will call you within 24 hours.');
        setPhone('');
        setShowSupportSheet(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Notifications tab only shown for broker accounts
  const tabs = [
    { icon: Home, label: 'Buy', path: '/properties?type=buy', match: '/properties' },
    { icon: Key, label: 'Rent', path: '/properties?type=rent', match: '/properties' },
    { icon: PlusSquare, label: 'Post', path: '/upload-house', match: '/upload-house' },
    ...(user?.role === 'broker' ? [{ icon: Bell, label: 'Alerts', path: '/broker/notifications', match: '/broker/notifications' }] : []),
    { icon: User, label: 'Account', path: 'account', match: 'account' },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg safe-bottom">
        <div className="max-w-lg mx-auto flex items-stretch h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.path === 'account'
              ? showAccountSheet
              : location.pathname + location.search === tab.path || location.pathname === tab.match;

            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.path === 'account') {
                    if (!user) { navigate('/login'); return; }
                    setShowAccountSheet(true);
                  } else {
                    setShowAccountSheet(false);
                    navigate(tab.path);
                  }
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{tab.label}</span>
                {active && tab.path !== 'account' && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Bottom Sheet */}
      {showAccountSheet && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={() => setShowAccountSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}>

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* User info */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-lg">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  {user?.role === 'broker' && (
                    <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      ✓ Verified Broker
                    </span>
                  )}
                  {user?.role === 'admin' && (
                    <span className="inline-block mt-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      🛡️ Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="px-4 py-2">

              <MenuItem icon={Building2} label="My Properties" sub="View your listings"
                onClick={() => { navigate('/my-properties'); setShowAccountSheet(false); }} />

              <MenuItem icon={Bookmark} label="Saved Properties" sub="View your wishlist"
                onClick={() => { navigate('/wishlist'); setShowAccountSheet(false); }} />

              {/* Broker-specific */}
              {user?.role === 'broker' && (
                <>
                  <MenuItem icon={Bell} label="Buyer Notifications" sub="View buyer interests"
                    onClick={() => { navigate('/broker/notifications'); setShowAccountSheet(false); }} />
                  <MenuItem icon={CreditCard} label="Payment History" sub="View your earnings"
                    onClick={() => { navigate('/broker/payment-history'); setShowAccountSheet(false); }} />
                  <MenuItem icon={Wallet} label="Withdrawal" sub="Withdraw earnings to bank/UPI"
                    onClick={() => { navigate('/broker/withdrawal'); setShowAccountSheet(false); }} />
                </>
              )}

              {/* User-specific */}
              {user?.role === 'user' && (
                <MenuItem icon={UserCheck} label="Become a Broker" sub="Start earning commissions"
                  onClick={() => { navigate('/become-broker'); setShowAccountSheet(false); }}
                  highlight />
              )}

              {/* Admin */}
              {user?.role === 'admin' && (
                <MenuItem icon={User} label="Admin Panel" sub="Manage the platform"
                  onClick={() => { navigate('/admin/dashboard'); setShowAccountSheet(false); }} />
              )}

              {/* Support */}
              <MenuItem icon={Phone} label="Customer Support" sub="Request a callback"
                onClick={() => { setShowAccountSheet(false); setShowSupportSheet(true); }} />

              {/* Logout */}
              <div className="mt-2 mb-4">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-semibold text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Support / Callback Sheet */}
      {showSupportSheet && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50" onClick={() => setShowSupportSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Customer Support</h3>
                <p className="text-sm text-gray-400">We'll call you back within 24 hours</p>
              </div>
              <button onClick={() => setShowSupportSheet(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Mobile Number</label>
              <input type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-base" />
            </div>

            <button onClick={handleCallbackRequest} disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-50 mb-3">
              {submitting ? 'Requesting...' : '📞 Request Callback'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Or call us directly:{' '}
              <a href="tel:+917297018503" className="text-blue-600 font-semibold">+91-7297018503</a>
            </p>
          </div>
        </>
      )}
    </>
  );
};

// Reusable menu item
const MenuItem: React.FC<{
  icon: any; label: string; sub: string; onClick: () => void; highlight?: boolean;
}> = ({ icon: Icon, label, sub, onClick, highlight }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${highlight ? 'bg-blue-50' : ''}`}>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${highlight ? 'bg-blue-600' : 'bg-gray-100'}`}>
      <Icon className={`w-4 h-4 ${highlight ? 'text-white' : 'text-gray-600'}`} />
    </div>
    <div className="flex-1">
      <p className={`text-sm font-semibold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300" />
  </button>
);

export default BottomNav;