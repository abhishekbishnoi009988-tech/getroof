import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      console.log('=== AUTH CALLBACK START ===');
      console.log('Full URL:', window.location.href);
      console.log('Search params:', window.location.search);
      
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      console.log('Token from URL:', token ? `YES (${token.substring(0, 20)}...)` : 'NO ❌');
      console.log('Error from URL:', error || 'NONE');

      if (error) {
        console.error('❌ OAuth Error:', error);
        toast.error(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (token) {
        console.log('✅ Token received, saving to localStorage...');
        localStorage.setItem('token', token);
        
        // Verify it was saved
        const savedToken = localStorage.getItem('token');
        console.log('✅ Token saved successfully:', savedToken ? 'YES' : 'NO ❌');
        
        toast.success('Login successful!');
        console.log('✅ Redirecting to home page...');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
          // Force reload to trigger Navbar auth check
          window.location.reload();
        }, 1000);
      } else {
        console.error('❌ No token in URL!');
        console.log('Available params:', Array.from(searchParams.entries()));
        toast.error('No authentication token received');
        setTimeout(() => navigate('/login'), 2000);
      }
      
      console.log('=== AUTH CALLBACK END ===');
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Completing Sign In</h2>
        <p className="text-gray-600 mb-4">Please wait while we log you in...</p>
        <p className="text-xs text-gray-400">Check the console (F12) for debug info</p>
      </div>
    </div>
  );
};

export default AuthCallback;