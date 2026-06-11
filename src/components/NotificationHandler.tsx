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
        // Verifica se o navegador suporta as APIs necessárias
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
          console.warn('Este navegador não suporta notificações push.');
          return;
        }

        // Solicita permissão
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Permissão de notificação não concedida.');
          return;
        }

        // Registra o Service Worker explicitamente
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        // Aguarda o Service Worker estar ativo
        await navigator.serviceWorker.ready;

        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        // Obtém o token usando a chave VAPID
        const currentToken = await getToken(messaging, {
          vapidKey: firebaseConfig.vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          console.log('Token FCM obtido com sucesso!');
          
          // Salva o token no Firestore do usuário
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            fcmToken: currentToken,
            updatedAt: new Date().toISOString()
          });
        } else {
          console.log('Nenhum token disponível. Verifique as configurações de mensagens do navegador.');
        }
      } catch (error) {
        console.error('Erro ao configurar notificações FCM:', error);
      }
    };

    // Executa com um pequeno atraso para não pesar no carregamento inicial
    const timer = setTimeout(setupNotifications, 3000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}
