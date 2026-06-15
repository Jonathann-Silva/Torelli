
'use client';
/**
 * Este arquivo contém a lógica de processamento de lembretes.
 * Como o ambiente é focado em cliente, a execução principal ocorre via gatilho no admin.
 */
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, Firestore } from 'firebase/firestore';
import { sendPushNotification } from './send-push';

export async function processAppointmentReminders(db: Firestore) {
  try {
    const now = new Date();
    
    // Buscar agendamentos confirmados
    const aptsQuery = query(
      collection(db, 'appointments'),
      where('status', '==', 'confirmed')
    );
    
    const snap = await getDocs(aptsQuery);
    let sentCount = 0;

    for (const aptDoc of snap.docs) {
      const apt = aptDoc.data();
      const aptId = aptDoc.id;

      // Converter data e hora do agendamento para objeto Date
      // Formato esperado: date: "YYYY-MM-DD", time: "HH:mm"
      const [year, month, day] = apt.date.split('-').map(Number);
      const [hours, minutes] = apt.time.split(':').map(Number);
      const aptDate = new Date(year, month - 1, day, hours, minutes);

      const diffMs = aptDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Lógica de Lembrete de 24 horas (Enviado entre 24h e 12h antes)
      if (diffHours <= 24 && diffHours > 4 && !apt.reminder1dSent) {
        await sendReminder(db, apt, aptId, '24h');
        await updateDoc(doc(db, 'appointments', aptId), { reminder1dSent: true });
        sentCount++;
      }

      // Lógica de Lembrete de 3 horas (Enviado entre 3h e 0h antes)
      if (diffHours <= 3 && diffHours > 0 && !apt.reminder3hSent) {
        await sendReminder(db, apt, aptId, '3h');
        await updateDoc(doc(db, 'appointments', aptId), { reminder3hSent: true });
        sentCount++;
      }
    }

    return { success: true, count: sentCount };
  } catch (error) {
    console.error('Erro ao processar lembretes:', error);
    return { success: false, error };
  }
}

async function sendReminder(db: Firestore, apt: any, aptId: string, type: '24h' | '3h') {
  if (!apt.userId) return;

  const userSnap = await getDoc(doc(db, 'users', apt.userId));
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  if (!userData.fcmToken) return;

  const formattedDate = apt.date.split('-').reverse().join('/');
  const title = type === '24h' ? "Lembrete de Agendamento" : "Seu horário está chegando!";
  const message = type === '24h' 
    ? `Lembrete: Você tem um agendamento de ${apt.serviceName} amanhã, ${formattedDate} às ${apt.time}.`
    : `Lembrete: Seu agendamento de ${apt.serviceName} é hoje às ${apt.time}. Estamos te esperando!`;

  // 1. Salvar notificação no Firestore para o cliente
  await addDoc(collection(db, 'notifications'), {
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
    type: 'info',
    recipientId: apt.userId,
    recipientRole: 'client'
  });

  // 2. Enviar Push real
  await sendPushNotification(userData.fcmToken, title, message, '/appointments');
}
