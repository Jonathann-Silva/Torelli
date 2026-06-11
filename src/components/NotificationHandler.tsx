
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

    const requestPermission = async () => {
      try {
        if (!('Notification' in window)) {
          console.warn('Este navegador não suporta notificações desktop');
          return;
        }

        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Permissão de notificação concedida.');
          
          // Registrar o Service Worker manualmente para garantir que ele esteja pronto antes do getToken
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registrado com sucesso:', registration.scope);

            const messaging = await getFirebaseMessaging();
            if (!messaging) return;

            // Obter o token usando a chave VAPID explicitamente
            const currentToken = await getToken(messaging, {
              vapidKey: firebaseConfig.vapidKey,
              serviceWorkerRegistration: registration,
            });

            if (currentToken) {
              console.log('Token FCM (VAPID) obtido com sucesso!');
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, {
                fcmToken: currentToken,
                updatedAt: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao configurar notificações push:', error);
      }
    };

    // Pequeno atraso para não impactar o carregamento inicial da página
    const timer = setTimeout(requestPermission, 2000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}
