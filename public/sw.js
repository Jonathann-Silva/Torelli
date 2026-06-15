
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
      badge: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
