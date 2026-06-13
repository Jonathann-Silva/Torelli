
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
 * Deve ser chamado a partir de um gesto de usuário (como clique em um botão)
 * para funcionar de forma confiável no iOS (Safari).
 */
export async function requestAndSaveNotificationPermission(db: Firestore, userId: string) {
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    throw new Error('Este navegador não suporta Service Workers.');
  }

  if (!('PushManager' in window)) {
    throw new Error('Este navegador não suporta a Push API.');
  }

  try {
    // 1. Registra o Service Worker dedicado para Web Push
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    // 2. Aguarda o Service Worker estar pronto e ativo
    await navigator.serviceWorker.ready;

    // 3. Solicita permissão ao usuário (gesto do usuário no iOS necessário)
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
      
      if (!publicVapidKey) {
        throw new Error('Chave VAPID pública não configurada no ambiente.');
      }

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      };

      // 4. Obtém ou cria uma nova subscrição do navegador
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Verifica se a chave mudou para re-inscrever se necessário
        const currentKey = urlBase64ToUint8Array(publicVapidKey);
        const subscriptionKey = subscription.options.applicationServerKey
          ? new Uint8Array(subscription.options.applicationServerKey)
          : null;

        let keysMatch = false;
        if (subscriptionKey && currentKey.length === subscriptionKey.length) {
          keysMatch = true;
          for (let i = 0; i < currentKey.length; i++) {
            if (currentKey[i] !== subscriptionKey[i]) {
              keysMatch = false;
              break;
            }
          }
        }

        if (!keysMatch) {
          await subscription.unsubscribe();
          subscription = await registration.pushManager.subscribe(subscribeOptions);
        }
      } else {
        subscription = await registration.pushManager.subscribe(subscribeOptions);
      }

      if (subscription) {
        const userRef = doc(db, 'users', userId);
        
        // 5. Salva o objeto de subscrição JSON no Firestore
        // Isso é o que o web-push usa no backend para enviar a mensagem
        await updateDoc(userRef, {
          fcmToken: JSON.stringify(subscription),
          updatedAt: new Date().toISOString()
        });
        
        return subscription;
      }
    } else {
      throw new Error(`Permissão de notificação negada: ${permission}`);
    }
  } catch (err: any) {
    console.error('Erro no fluxo de Push:', err);
    throw err;
  }

  return null;
}
