import React from 'react';
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




function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Dashboard is the home page */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />  {/* ← ADD THIS LINE! */}
        
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

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Payment Routes */}
        <Route path="/broker/record-sale" element={<RecordSale />} />
        <Route path="/broker/payment-history" element={<PaymentHistory />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;