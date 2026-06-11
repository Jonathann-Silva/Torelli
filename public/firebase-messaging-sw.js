
// Scripts necessários para o Firebase em segundo plano
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração idêntica à do seu app (necessária para o Service Worker inicializar)
firebase.initializeApp({
  apiKey: "AIzaSyBTZaJyyb29f0ZBElswfl0y3k1AN0FEDso",
  authDomain: "studio-3657521221-d612e.firebaseapp.com",
  projectId: "studio-3657521221-d612e",
  storageBucket: "studio-3657521221-d612e.firebasestorage.app",
  messagingSenderId: "178968479488",
  appId: "1:178968479488:web:9ccedca68620490e79d5e5"
});

const messaging = firebase.messaging();

// Escuta mensagens quando o app está fechado ou em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ', payload);
  
  const notificationTitle = payload.notification.title || 'Barbearia Torelli';
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
    badge: 'https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
