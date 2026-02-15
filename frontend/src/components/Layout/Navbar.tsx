import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      checkAuth();
    }
  }, [location.pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await API.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data);
        console.log('✅ User data loaded:', response.data.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">GETROOF</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">GETROOF</span>
            </Link>
          </div>

          {/* Hamburger button - mobile only */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
            {user ? (
              <>
                <Link to="/upload-house" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-md text-sm font-bold hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all">
                  🏠 Upload Your House
                </Link>
                {user.role === 'broker' && (
                  <>
                    <Link to="/broker/notifications" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">🔔 Notifications</Link>
                    <Link to="/broker/record-sale" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">Record Sale</Link>
                    <Link to="/broker/payment-history" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">💰 Earnings</Link>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">✓ Broker</span>
                  </>
                )}
                <Link to="/my-properties" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">My Properties</Link>
                {user.role !== 'broker' && (
                  <Link to="/become-broker" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Become a Broker</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700">🛡️ Admin Panel</Link>
                )}
                <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                      <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            {user ? (
              <>
                <Link to="/upload-house" className="block px-4 py-2 text-sm text-green-600 font-bold hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>🏠 Upload Your House</Link>
                <Link to="/my-properties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>My Properties</Link>
                {user.role === 'broker' && (
                  <>
                    <Link to="/broker/notifications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>🔔 Notifications</Link>
                    <Link to="/broker/record-sale" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Record Sale</Link>
                    <Link to="/broker/payment-history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>💰 Earnings</Link>
                  </>
                )}
                {user.role !== 'broker' && (
                  <Link to="/become-broker" className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Become a Broker</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-purple-600 font-medium hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>🛡️ Admin Panel</Link>
                )}
                <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
 