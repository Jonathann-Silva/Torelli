
'use server';

import webpush from 'web-push';

// Tenta pegar a chave de ambos os nomes possíveis para garantir compatibilidade
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contato@barber-torelli.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID Keys não configuradas corretamente no servidor.');
}

export async function sendPushNotification(subscriptionJson: string, title: string, body: string, url: string = '/') {
  try {
    if (!subscriptionJson) return { success: false, error: 'Sem subscrição' };
    
    const subscription = JSON.parse(subscriptionJson);
    const payload = JSON.stringify({ 
      title, 
      body, 
      url 
    });
    
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar push nativo via web-push:', error);
    return { success: false, error };
  }
}
