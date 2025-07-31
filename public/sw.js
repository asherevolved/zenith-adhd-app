// public/sw.js

self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/zenith-logo.png', // Main app icon
    badge: '/zenith-badge.png', // A smaller icon for the notification bar
    vibrate: [200, 100, 200, 100, 200, 100, 200], // Vibration pattern
    sound: '/notification.mp3', // Path to a sound file
    data: {
      url: data.url || '/', // URL to open when notification is clicked
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // If a window for the app is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
