
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
          console.warn('Push nativo não suportado neste navegador.');
          return;
        }

        // Registra o Service Worker explicitamente
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Aguarda o Service Worker ficar pronto
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
          
          if (!publicVapidKey) {
            console.error('Chave Pública VAPID não encontrada no ambiente.');
            return;
          }

          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          };

          let subscription = await registration.pushManager.getSubscription();
          
          // Se não houver subscrição ou as chaves mudaram, cria uma nova
          if (!subscription) {
            subscription = await registration.pushManager.subscribe(subscribeOptions);
          }

          if (subscription) {
            console.log('Push Subscription (Web Push) obtido com sucesso.');
            const userRef = doc(db, 'users', user.uid);
            
            // Salvamos a subscrição completa (JSON) que o web-push precisa para enviar
            await updateDoc(userRef, {
              fcmToken: JSON.stringify(subscription),
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Erro ao configurar Web Push nativo:', error);
      }
    };

    // Pequeno atraso para garantir que o navegador carregou tudo
    const timer = setTimeout(setupPush, 2000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}
