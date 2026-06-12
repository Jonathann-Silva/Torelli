
'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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

export function NotificationHandler() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    // Só tentamos configurar se o usuário estiver logado
    if (!user || !db) return;

    const setupPush = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.warn('Este navegador não suporta notificações Push.');
          return;
        }

        // 1. Registra o Service Worker dedicado para Web Push
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        // 2. Aguarda o Service Worker estar pronto e ativo
        await navigator.serviceWorker.ready;

        // 3. Solicita permissão ao usuário
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
          
          if (!publicVapidKey) {
            console.error('ERRO: NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada.');
            return;
          }

          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          };

          // 4. Obtém ou cria uma nova subscrição do navegador
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            subscription = await registration.pushManager.subscribe(subscribeOptions);
          }

          if (subscription) {
            const userRef = doc(db, 'users', user.uid);
            
            // 5. Salva o objeto de subscrição JSON no Firestore
            // O web-push precisa desse JSON completo para enviar a mensagem
            await updateDoc(userRef, {
              fcmToken: JSON.stringify(subscription),
              updatedAt: new Date().toISOString()
            });
            console.log('Subscrição Web Push salva com sucesso.');
          }
        }
      } catch (error) {
        console.error('Falha ao configurar Notificações Push:', error);
      }
    };

    // Delay de 2 segundos para não impactar o carregamento inicial e garantir hidratração
    const timer = setTimeout(setupPush, 2000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}
