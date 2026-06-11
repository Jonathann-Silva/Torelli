
'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationHandler() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (!user || !db) return;

    const setupPush = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.warn('Push não suportado neste dispositivo.');
          return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''
            )
          };

          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            subscription = await registration.pushManager.subscribe(subscribeOptions);
          }

          if (subscription) {
            console.log('Push Subscription obtido com sucesso.');
            const userRef = doc(db, 'users', user.uid);
            // Salvamos o objeto completo da subscrição como string no campo fcmToken
            await updateDoc(userRef, {
              fcmToken: JSON.stringify(subscription),
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Erro ao configurar Push nativo:', error);
      }
    };

    setupPush();
  }, [user, db]);

  return null;
}
