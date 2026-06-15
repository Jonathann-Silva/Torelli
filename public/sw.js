
/**
 * Service Worker para notificações Web Push Nativo.
 * Este arquivo deve estar na raiz da pasta public.
 */

self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Barber Torelli',
      body: event.data.text() || 'Você tem uma nova atualização.'
    };
  }

  const options = {
    body: data.body,
    icon: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
    badge: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
    data: {
      url: data.url || '/'
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Ver Agora' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then(() => client.navigate(urlToOpen));
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
