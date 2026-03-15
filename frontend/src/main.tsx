import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import { requestNotificationPermission, onForegroundMessage } from './firebase';
import API from './services/api';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Register main SW
      await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered');

      // Register Firebase messaging SW
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Firebase messaging SW registered');

      // Request push notification permission if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          // Save FCM token to backend
          try {
            await API.post('/auth/fcm-token', { fcmToken });
            console.log('FCM token saved to backend');
          } catch (err) {
            console.error('Failed to save FCM token:', err);
          }
        }
      }

      // Handle foreground notifications (app is open)
      onForegroundMessage((payload) => {
        const { title, body } = payload.notification || {};
        toast.custom((t) => (
          <div className={`bg-white shadow-lg rounded-xl p-4 border-l-4 border-blue-600 flex items-start gap-3 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            <div className="text-2xl">🏠</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{title || 'GETROOF'}</p>
              <p className="text-gray-600 text-xs mt-0.5">{body}</p>
            </div>
          </div>
        ), { duration: 5000 });
      });

    } catch (err) {
      console.log('SW registration error:', err);
    }
  });
}