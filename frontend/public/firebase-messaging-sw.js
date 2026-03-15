// Firebase Messaging Service Worker
// Handles push notifications when the app is in background or closed

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAj_H8iS5-wSCFYiWD4QeH51V-0YnvMERc",
  authDomain: "getroof.firebaseapp.com",
  projectId: "getroof",
  storageBucket: "getroof.firebasestorage.app",
  messagingSenderId: "677537169823",
  appId: "1:677537169823:web:8b0a9b9a3a57e125de7daa"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { title, body } = payload.notification || {};
  const notificationTitle = title || 'GETROOF';
  const notificationOptions = {
    body: body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'getroof-notification',
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('getroof.in') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('https://getroof.in/broker/notifications');
      }
    })
  );
});