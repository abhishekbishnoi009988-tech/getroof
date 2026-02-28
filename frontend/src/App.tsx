import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadHouse from './pages/UploadHouse';
import BecomeBroker from './pages/BecomeBroker';
import BrokerNotifications from './pages/BrokerNotifications';
import PropertyDetail from './pages/PropertyDetail';
import MyProperties from './pages/MyProperties';
import RecordSale from './pages/RecordSale';
import PaymentHistory from './pages/PaymentHistory';
import PropertyList from './pages/PropertyList';
import WithdrawalPage from './pages/WithdrawalPage';

function App() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (isInstalled || dismissed) return;

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setShowBanner(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Dashboard is the home page */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Main Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Property Routes */}
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/upload-house" element={<UploadHouse />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/properties" element={<PropertyList />} />

        {/* Legal Routes */}
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        {/* Broker Routes */}
        <Route path="/become-broker" element={<BecomeBroker />} />
        <Route path="/broker/notifications" element={<BrokerNotifications />} />
        <Route path="/broker/withdrawal" element={<WithdrawalPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Payment Routes */}
        <Route path="/broker/record-sale" element={<RecordSale />} />
        <Route path="/broker/payment-history" element={<PaymentHistory />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* PWA Install Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-blue-500 shadow-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/icon-192.png" alt="GETROOF" className="w-12 h-12 rounded-xl" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Add GETROOF to Home Screen</p>
              <p className="text-xs text-gray-500">Install for faster access</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-2 rounded-full">
              ✕
            </button>
            <button onClick={handleInstall} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700">
              Install
            </button>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;