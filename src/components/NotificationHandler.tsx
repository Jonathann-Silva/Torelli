'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, getFirebaseMessaging } from '@/firebase';
import { getToken } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { toast } from '@/hooks/use-toast';

export function NotificationHandler() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    if (!user || !db) return;

    const requestPermission = async () => {
      try {
        // Verifica se o navegador suporta notificações
        if (!('Notification' in window)) {
          console.warn('Este navegador não suporta notificações desktop');
          return;
        }

        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, {
            vapidKey: firebaseConfig.vapidKey,
          });

          if (currentToken) {
            // Salva o token no documento do usuário
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              fcmToken: currentToken,
              updatedAt: new Date().toISOString()
            });
            console.log('Token FCM atualizado com sucesso');
          } else {
            console.warn('Nenhum token FCM disponível. Verifique as permissões.');
          }
        } else if (permission === 'denied') {
          console.warn('Permissão de notificação negada pelo usuário');
        }
      } catch (error) {
        console.error('Erro ao configurar notificações push:', error);
      }
    };

    // Pequeno atraso para não atrapalhar o carregamento inicial
    const timer = setTimeout(requestPermission, 2000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}
