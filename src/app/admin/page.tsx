
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

      // Se estiver completando, adicionar pontos
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

      // 3. Criar Notificação para o Cliente
      const messages = {
        confirmed: "Seu agendamento foi aprovado pelo barbeiro!",
        cancelled: "Infelizmente seu agendamento precisou ser cancelado.",
        completed: "Obrigado pela visita! Seu ponto de fidelidade foi computado."
      };

      await addDoc(collection(db, 'notifications'), {
        title: newStatus === 'confirmed' ? "Agendamento Confirmado" : "Atualização de Status",
        message: messages[newStatus],
        createdAt: new Date().toISOString(),
        read: false,
        type: newStatus === 'cancelled' ? 'alert' : 'success',
        recipientId: appointment.userId,
        recipientRole: 'client'
      });

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
    <div className="min-h-screen pb-32 bg-black">
      <Header />
      
      <main className="pt-20 px-5 space-y-10">
        <section className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tighter">Visão Geral</h2>
          <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest">Painel Administrativo</p>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="premium-card p-6 rounded-3xl bg-primary/5 border-primary/10">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Receita (Recente)</span>
            <h3 className="text-3xl font-black text-primary mt-1">R$ {totalRevenue.toFixed(2)}</h3>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-black text-white tracking-tight leading-none">Gestão de Agendamentos</h2>
          
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : appointments.map((apt: any) => {
              const isPending = apt.status === 'pending';
              const isConfirmed = apt.status === 'confirmed';

              return (
                <div key={apt.id} className="premium-card p-4 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary relative overflow-hidden">
                        <Image src={PlaceHolderImages.find(i => i.id === 'client1')?.imageUrl || ''} alt="C" fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground">{apt.clientName}</h4>
                        <p className="text-[9px] text-muted-foreground">{apt.date} às {apt.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${apt.status === 'pending' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-secondary/30 text-muted-foreground border-white/5'}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {isPending && (
                      <>
                        <Button size="sm" onClick={() => handleUpdateStatus(apt, 'confirmed')} className="flex-1 h-8 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest">
                          Aceitar
                        </Button>
                        <Button size="sm" onClick={() => handleUpdateStatus(apt, 'cancelled')} variant="outline" className="flex-1 h-8 border-destructive/20 text-destructive text-[8px] font-black uppercase tracking-widest">
                          Recusar
                        </Button>
                      </>
                    )}
                    {isConfirmed && (
                      <Button size="sm" onClick={() => handleUpdateStatus(apt, 'completed')} className="w-full h-8 bg-green-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-green-700">
                        Concluir Atendimento
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
