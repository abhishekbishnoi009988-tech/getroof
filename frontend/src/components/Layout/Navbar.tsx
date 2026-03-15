import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

interface NavbarProps {
  user?: any; // optional — if passed from parent, skip re-fetching
}

const Navbar: React.FC<NavbarProps> = ({ user: propUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!propUser) checkAuth();
  }, []);

  useEffect(() => {
    if (propUser) setUser(propUser);
  }, [propUser]);

  useEffect(() => {
    if (!propUser && localStorage.getItem('token')) checkAuth();
  }, [location.pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const response = await API.get('/auth/me');
      if (response.data.success) setUser(response.data.data);
    } catch (_) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">GETROOF</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/" className="text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">Home</Link>

            {loading ? (
              <div className="animate-pulse h-8 w-20 bg-gray-100 rounded-lg" />
            ) : user ? (
              <>
                <Link to="/upload-house"
                  className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm">
                  + List Property
                </Link>

                {user.role === 'broker' && (
                  <>
                    <Link to="/broker/notifications" className="text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                      Notifications
                    </Link>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">✓ Broker</span>
                  </>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">
                    Admin Panel
                  </Link>
                )}

                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xs">{user.name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <Link to="/my-properties" onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        My Properties
                      </Link>
                      {user.role === 'broker' && (
                        <>
                          <Link to="/broker/payment-history" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            Payment History
                          </Link>
                          <Link to="/broker/withdrawal" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            Withdrawal
                          </Link>
                        </>
                      )}
                      {user.role === 'user' && (
                        <Link to="/become-broker" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50">
                          Become a Broker
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-2">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile — just logo + login/signup if not logged in */}
          <div className="flex md:hidden items-center gap-2">
            {!loading && !user && (
              <Link to="/login" className="text-sm text-blue-600 font-semibold px-3 py-1.5 border border-blue-200 rounded-lg">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;