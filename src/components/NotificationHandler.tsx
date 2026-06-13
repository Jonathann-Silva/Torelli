
'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { requestAndSaveNotificationPermission } from '@/lib/pushNotifications';

export function NotificationHandler() {
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    // Só tentamos configurar se o usuário estiver logado
    if (!user || !db) return;

    const setupPushSilently = async () => {
      try {
        // Se a permissão já foi concedida, atualiza silenciosamente em segundo plano.
        // Se não foi concedida ('default' ou 'denied'), não forçamos via useEffect
        // para evitar que o iOS Safari bloqueie a requisição silenciosa ou lance erros.
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          await requestAndSaveNotificationPermission(db, user.uid);
          console.log('Subscrição Web Push atualizada silenciosamente.');
        }
      } catch (error) {
        console.error('Falha ao atualizar silenciosamente notificações Push:', error);
      }
    };

    // Delay de 2 segundos para não impactar o carregamento inicial
    const timer = setTimeout(setupPushSilently, 2000);
    return () => clearTimeout(timer);
  }, [user, db]);

  return null;
}

