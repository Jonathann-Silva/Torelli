
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
        // 1. Verificar suporte a notificações
        if (!('Notification' in window)) {
          console.warn('Este navegador não suporta notificações desktop');
          return;
        }

        // 2. Solicitar permissão explicitamente
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Permissão de notificação concedida.');
          
          const messaging = await getFirebaseMessaging();
          if (!messaging) {
            console.error('Firebase Messaging não inicializado.');
            return;
          }

          // 3. Obter o token FCM
          // O serviceWorker deve estar no diretório /public/firebase-messaging-sw.js
          const currentToken = await getToken(messaging, {
            vapidKey: firebaseConfig.vapidKey,
          });

          if (currentToken) {
            console.log('Token FCM obtido:', currentToken);
            // Salva o token no documento do usuário para uso futuro pelo admin
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              fcmToken: currentToken,
              updatedAt: new Date().toISOString()
            });
          } else {
            console.warn('Nenhum token disponível. Verifique se o Service Worker foi registrado corretamente.');
          }
        } else {
          console.warn('Permissão de notificação negada ou ignorada:', permission);
        }
      } catch (error) {
        console.error('Erro ao configurar notificações push:', error);
      }
    };

    // Atraso intencional para garantir que o service worker tenha tempo de carregar
    const timer = setTimeout(requestPermission, 3000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}
