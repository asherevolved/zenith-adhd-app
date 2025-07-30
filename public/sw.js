
// public/sw.js

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'Zenith Reminder';
  const options = {
    body: data.body,
    icon: '/icon-192x192.png', // Make sure you have an icon file here
    badge: '/badge-72x72.png', // and here
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        client.focus();
        return client.