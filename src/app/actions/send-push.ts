
'use server';

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contato@barber-torelli.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(subscriptionJson: string, title: string, body: string, url: string = '/') {
  try {
    if (!subscriptionJson) {
      console.warn('Tentativa de envio sem subscrição válida.');
      return { success: false, error: 'Sem subscrição' };
    }
    
    // A subscrição salva no Firestore deve ser o objeto JSON completo retornado pelo navegador
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
