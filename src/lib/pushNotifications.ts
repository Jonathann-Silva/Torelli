
'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

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

export async function requestAndSaveNotificationPermission(db: Firestore, userId: string) {
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    throw new Error('Este navegador não suporta Service Workers.');
  }

  // O pedido de permissão deve ser a PRIMEIRA ação após o clique no iOS.
  const permission = await Notification.requestPermission();
  
  if (permission !== 'granted') {
    // Se for 'denied', o navegador não mostrará o prompt novamente.
    // O componente pai deve tratar isso mostrando instruções.
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    await navigator.serviceWorker.ready;

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
    
    if (!publicVapidKey) {
      throw new Error('Chave VAPID pública não configurada.');
    }

    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    };

    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe(subscribeOptions);
    }

    if (subscription) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: JSON.stringify(subscription),
        updatedAt: new Date().toISOString()
      });
      return subscription;
    }
  } catch (err: any) {
    console.error('Erro no registro do Push:', err);
    throw err;
  }

  return null;
}
