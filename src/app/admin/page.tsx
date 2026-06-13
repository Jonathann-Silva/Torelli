"use client"

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TrendingUp, DollarSign, MoreVertical, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, getDoc, increment, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { sendPushNotification } from '@/app/actions/send-push';

export default function AdminDashboard() {
  const db = useFirestore();

  const appointmentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'appointments'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db]);

  const { data: appointments = [], loading } = useCollection(appointmentsQuery);

  const handleUpdateStatus = async (appointment: any, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    if (!db) return;

    try {
      const aptRef = doc(db, 'appointments', appointment.id);
      await updateDoc(aptRef, { status: newStatus });

      if (newStatus === 'completed' && appointment.userId) {
        const userRef = doc(db, 'users', appointment.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const points = userSnap.data().loyaltyPoints || 0;
          if (points >= 10) {
            await updateDoc(userRef, { loyaltyPoints: 0 });
          } else {
            await updateDoc(userRef, { loyaltyPoints: increment(1) });
          }
        }
      }

      const messages = {
        confirmed: "Seu agendamento foi aprovado pelo barbeiro!",
        cancelled: "Infelizmente seu agendamento precisou ser cancelado.",
        completed: "Obrigado pela visita! Seu ponto de fidelidade foi computado."
      };

      const title = newStatus === 'confirmed' ? "Agendamento Confirmado" : "Atualização de Status";
      const message = messages[newStatus];

      await addDoc(collection(db, 'notifications'), {
        title: title,
        message: message,
        createdAt: new Date().toISOString(),
        read: false,
        type: newStatus === 'cancelled' ? 'alert' : 'success',
        recipientId: appointment.userId,
        recipientRole: 'client'
      });

      if (appointment.userId) {
        const userRef = doc(db, 'users', appointment.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().fcmToken) {
          await sendPushNotification(userSnap.data().fcmToken, title, message);
        }
      }

      toast({
        title: "Status Atualizado",
        description: `O agendamento de ${appointment.clientName} está agora como ${newStatus}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  const totalRevenue = appointments
    .filter((a: any) => a.status === 'completed')
    .reduce((acc: number, curr: any) => acc + (Number(curr.price) || 0), 0);

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <main className="pt-24 px-5 space-y-10 max-w-container-max mx-auto">
        <section className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tighter">Visão Geral</h2>
          <p className="text-muted-foreground text-sm font-medium">Painel Administrativo da Barbearia</p>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="premium-card p-8 rounded-3xl bg-primary/5 border-primary/20 amber-glow">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Receita Total (Concluídos)</span>
            <h3 className="text-4xl font-black text-primary mt-2">R$ {totalRevenue.toFixed(2)}</h3>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white tracking-tight shrink min-w-0">Agendamentos</h2>
            <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shrink-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">Tempo Real</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : appointments.length > 0 ? (
              appointments.map((apt: any) => {
                const isPending = apt.status === 'pending';
                const isConfirmed = apt.status === 'confirmed';
                const formattedDate = apt.date ? apt.date.split('-').reverse().join('-') : '---';

                return (
                  <div key={apt.id} className="premium-card p-6 rounded-3xl flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-secondary relative overflow-hidden border border-white/5">
                          <Image src={PlaceHolderImages.find(i => i.id === 'client1')?.imageUrl || ''} alt="C" fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg text-foreground leading-none">{apt.clientName}</h4>
                          <p className="text-xs text-muted-foreground mt-2">{formattedDate} às {apt.time}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${apt.status === 'pending' ? 'bg-primary/20 text-primary border-primary/20 animate-pulse' : 'bg-secondary/30 text-muted-foreground border-white/5'}`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    <div className="flex gap-3">
                      {isPending && (
                        <>
                          <Button 
                            onClick={() => handleUpdateStatus(apt, 'confirmed')} 
                            className="flex-1 h-12 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl amber-glow"
                          >
                            Aceitar
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(apt, 'cancelled')} 
                            variant="outline" 
                            className="flex-1 h-12 border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-destructive/5"
                          >
                            Recusar
                          </Button>
                        </>
                      )}
                      {isConfirmed && (
                        <Button 
                          onClick={() => handleUpdateStatus(apt, 'completed')} 
                          className="w-full h-12 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-900/20"
                        >
                          Concluir Atendimento
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center opacity-30">
                <p className="font-black uppercase tracking-widest">Nenhum agendamento encontrado</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
