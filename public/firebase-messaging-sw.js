// Este arquivo deve residir na pasta public para ser acessível pelo navegador
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configurações do Firebase (Públicas)
const firebaseConfig = {
  apiKey: "AIzaSyBTZaJyyb29f0ZBElswfl0y3k1AN0FEDso",
  authDomain: "studio-3657521221-d612e.firebaseapp.com",
  projectId: "studio-3657521221-d612e",
  storageBucket: "studio-3657521221-d612e.firebasestorage.app",
  messagingSenderId: "178968479488",
  appId: "1:178968479488:web:9ccedca68620490e79d5e5"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Lida com mensagens recebidas em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/torelli-icon.png', // Ajuste para o caminho do seu ícone
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
