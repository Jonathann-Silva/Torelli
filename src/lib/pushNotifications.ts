'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

/**
 * Converte a chave VAPID Base64 para Uint8Array necessário para o navegador
 */
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

/**
 * Registra o Service Worker, solicita permissão e salva o token no Firestore.
 * Otimizado para iOS: a permissão é solicitada imediatamente após o clique.
 */
export async function requestAndSaveNotificationPermission(db: Firestore, userId: string) {
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    throw new Error('Este navegador não suporta Service Workers.');
  }

  // 1. SOLICITAR PERMISSÃO IMEDIATAMENTE (Requisito Crítico do iOS)
  // Isso deve ocorrer o mais próximo possível do clique do usuário.
  const permission = await Notification.requestPermission();
  
  if (permission !== 'granted') {
    throw new Error(`Permissão negada: ${permission}`);
  }

  try {
    // 2. Registra o Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    // 3. Aguarda o Service Worker estar pronto
    await navigator.serviceWorker.ready;

    // 4. Obtém a chave pública VAPID
    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
    
    if (!publicVapidKey) {
      throw new Error('Chave VAPID pública não configurada.');
    }

    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    };

    // 5. Gera ou recupera a subscrição do Push Manager
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe(subscribeOptions);
    }

    if (subscription) {
      const userRef = doc(db, 'users', userId);
      
      // Salva a subscrição completa para o web-push disparar depois
      await updateDoc(userRef, {
        fcmToken: JSON.stringify(subscription),
        updatedAt: new Date().toISOString()
      });
      
      return subscription;
    }
  } catch (err: any) {
    console.error('Erro no fluxo de Push:', err);
    throw err;
  }

  return null;
}
