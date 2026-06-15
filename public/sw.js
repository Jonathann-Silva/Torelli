
/*
* Service Worker para Notificações Web Push
*/
self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
        badge: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
        data: {
          url: data.url || '/'
        },
        vibrate: [200, 100, 200]
      };
      event.waitUntil(
        self.registration.showNotification(data.title || 'Barber Torelli', options)
      );
    } catch (e) {
      console.error('Erro ao processar payload da notificação:', e);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
