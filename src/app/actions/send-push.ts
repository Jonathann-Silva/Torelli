
'use server';

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contato@barber-torelli.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(subscriptionJson: string, title: string, body: string) {
  try {
    const subscription = JSON.parse(subscriptionJson);
    const payload = JSON.stringify({ title, body });
    
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar push nativo:', error);
    return { success: false, error };
  }
}
