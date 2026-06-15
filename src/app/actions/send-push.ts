'use server';

import webpush from 'web-push';

export async function sendPushNotification(subscriptionJson: string, title: string, body: string, url: string = '/') {
  // As chaves devem ser extraídas apenas durante a execução para evitar erros de build
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('Configuração VAPID incompleta para envio de Push.');
    return { success: false, error: 'Chaves ausentes no ambiente do servidor.' };
  }

  try {
    webpush.setVapidDetails(
      'mailto:contato@barber-torelli.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    if (!subscriptionJson) {
      return { success: false, error: 'Nenhuma subscrição disponível para este usuário.' };
    }
    
    const subscription = JSON.parse(subscriptionJson);
    const payload = JSON.stringify({ 
      title, 
      body, 
      url 
    });
    
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao disparar Web Push:', error);
    return { success: false, error: error.message || error };
  }
}
