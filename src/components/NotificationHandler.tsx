'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, getFirebaseMessaging } from '@/firebase';
import { getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export function NotificationHandler() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (!user || !db) return;

    const setupNotifications = async () => {
      try {
        // 1. Verificações Básicas de Suporte
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
          console.warn('Push não suportado neste navegador.');
          return;
        }

        // 2. Solicitação de Permissão (Explícita)
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Permissão negada pelo usuário.');
          return;
        }

        // 3. Registro do Service Worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        // 4. Obtenção do Messaging instance
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        // 5. Obtenção do Token com a chave VAPID da Vercel
        const currentToken = await getToken(messaging, {
          vapidKey: firebaseConfig.vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          console.log('FCM Token obtido:', currentToken);
          
          // 6. Salvando no Firestore para uso futuro pelo servidor
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            fcmToken: currentToken,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Erro ao registrar notificações:', error);
      }
    };

    // Pequeno atraso para garantir que o hidratamento do React terminou
    const timer = setTimeout(setupNotifications, 5000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}
