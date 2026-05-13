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
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, {
            vapidKey: firebaseConfig.vapidKey,
          });

          if (currentToken) {
            // Salva o token no documento do usuário para que o admin possa enviar pushes
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              fcmToken: currentToken,
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Erro ao configurar notificações push:', error);
      }
    };

    requestPermission();
  }, [user, db]);

  return null;
}
