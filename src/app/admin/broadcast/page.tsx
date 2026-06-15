
"use client"

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Send, Loader2, MessageSquare, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { sendPushNotification } from '@/app/actions/send-push';
import { useRouter } from 'next/navigation';

export default function AdminBroadcastPage() {
  const db = useFirestore();
  const router = useRouter();
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const handleSendBroadcast = async () => {
    if (!db || !broadcastTitle || !broadcastMessage) {
      toast({ title: "Campos obrigatórios", description: "Preencha o título e a mensagem para enviar.", variant: "destructive" });
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      let count = 0;

      const promises = usersSnap.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // 1. Save in Firestore notifications collection for the user
        await addDoc(collection(db, 'notifications'), {
          title: broadcastTitle,
          message: broadcastMessage,
          createdAt: new Date().toISOString(),
          read: false,
          type: 'info',
          recipientId: userId,
          recipientRole: 'client'
        });

        // 2. Send Push Notification if token exists
        if (userData.fcmToken) {
          try {
            await sendPushNotification(userData.fcmToken, broadcastTitle, broadcastMessage);
          } catch (e) {
            console.error(`Falha ao enviar push para ${userId}`, e);
          }
        }
        count++;
      });

      await Promise.all(promises);

      toast({ 
        title: "Comunicado Enviado!", 
        description: `Sua mensagem foi enviada para ${count} usuários cadastrados.` 
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      router.push('/admin/settings');
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao processar envio em massa.", variant: "destructive" });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-5 space-y-10 max-w-[480px] mx-auto">
        <header className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
          </button>
          
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Comunicado Geral</h2>
            <p className="text-sm font-medium text-muted-foreground">Envie uma mensagem para todos os seus clientes de uma vez.</p>
          </div>
        </header>

        <section className="space-y-6">
          <div className="premium-card p-6 rounded-3xl space-y-6 bg-secondary/20 border-white/5">
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Título do Comunicado</Label>
              <Input 
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Ex: Promoção de Natal 🎄"
                className="bg-background/50 border-white/5 rounded-xl h-14 text-sm focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Mensagem para os Clientes</Label>
              <Textarea 
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Digite aqui o aviso que todos os clientes cadastrados receberão..."
                className="bg-background/50 border-white/5 rounded-xl min-h-[180px] text-sm resize-none focus:ring-primary"
              />
            </div>

            <Button 
              disabled={isSendingBroadcast || !broadcastTitle || !broadcastMessage}
              onClick={handleSendBroadcast}
              className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl amber-glow shadow-xl active:scale-95 transition-all"
            >
              {isSendingBroadcast ? <Loader2 className="animate-spin" /> : (
                <div className="flex items-center gap-2">
                  <Send size={18} />
                  Disparar Mensagem
                </div>
              )}
            </Button>
            
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] text-center text-muted-foreground font-bold leading-relaxed">
                * Ao enviar, todos os usuários receberão uma notificação no aplicativo e um aviso push em seus dispositivos.
              </p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
