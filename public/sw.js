
self.addEventListener('push', function (event) {
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
      badge: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
      data: { url: data.url || '/' },
      vibrate: [100, 50, 100],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (error) {
    console.error('Error in push event:', error);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
