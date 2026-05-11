
"use client"

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TrendingUp, DollarSign, MoreVertical, CheckCircle2, Loader2, Check } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, getDoc, increment, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const db = useFirestore();

  const appointmentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'appointments'),
      orderBy('date', 'desc'),
      orderBy('time', 'desc'),
      limit(10)
    );
  }, [db]);

  const { data: appointments = [], loading } = useCollection(appointmentsQuery);

  const handleCompleteAppointment = async (appointment: any) => {
    if (!db) return;

    try {
      const aptRef = doc(db, 'appointments', appointment.id);
      
      // Marca como concluído
      await updateDoc(aptRef, { status: 'completed' });

      // Se tiver userId vinculado, atualiza a fidelidade
      if (appointment.userId) {
        const userRef = doc(db, 'users', appointment.userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const currentPoints = userSnap.data().loyaltyPoints || 0;
          
          if (currentPoints >= 10) {
            // Se já tinha 10, o desconto foi aplicado agora, então reseta para 0
            await updateDoc(userRef, { loyaltyPoints: 0 });
            toast({
              title: "Fidelidade Aplicada",
              description: `Desconto utilizado por ${appointment.clientName}. O contador reiniciou.`,
            });
          } else {
            // Caso contrário, adiciona um ponto
            await updateDoc(userRef, { loyaltyPoints: increment(1) });
            toast({
              title: "Ponto Adicionado",
              description: `O cliente ${appointment.clientName} agora tem ${currentPoints + 1}/10 pontos.`,
            });
          }
        }
      } else {
        toast({
          title: "Agendamento Concluído",
          description: "O serviço foi finalizado com sucesso.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao concluir",
        description: "Não foi possível atualizar o status do agendamento.",
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
      
      <main className="pt-20 px-5 space-y-10">
        <section className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tighter leading-none">Visão Geral</h2>
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">Performance Recente</p>
        </section>

        {/* Summary Grid */}
        <section className="grid grid-cols-1 gap-4">
          <div className="premium-card p-6 rounded-3xl h-36 flex flex-col justify-between relative overflow-hidden group">
            <DollarSign className="absolute -right-2 -top-2 opacity-5" size={80} />
            <div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Receita (Recente)</span>
              <h3 className="text-3xl font-black text-primary mt-1">R$ {totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="flex items-center gap-1 text-primary font-bold text-[9px]">
              <TrendingUp size={12} />
              <span className="uppercase tracking-widest">Vendas Concluídas</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="premium-card p-5 rounded-3xl h-36 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Pendentes</span>
                <h3 className="text-3xl font-black text-white mt-1">
                  {appointments.filter((a: any) => a.status === 'confirmed').length}
                </h3>
              </div>
              <div className="text-muted-foreground font-bold text-[8px] uppercase tracking-tighter">
                Aguardando atendimento
              </div>
            </div>

            <div className="premium-card p-5 rounded-3xl h-36 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Finalizados</span>
                <h3 className="text-3xl font-black text-white mt-1">
                  {appointments.filter((a: any) => a.status === 'completed').length}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-primary font-bold text-[8px]">
                <CheckCircle2 size={10} />
                <span className="uppercase tracking-tighter">Histórico Ativo</span>
              </div>
            </div>
          </div>
        </section>

        {/* Next Appointments */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-black text-white tracking-tight leading-none">Gestão de Agendamentos</h2>
            <button className="text-[10px] font-black text-primary uppercase border-b border-primary/30 tracking-widest pb-0.5">Histórico</button>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : appointments.length > 0 ? (
              appointments.map((apt: any) => {
                const cImg = PlaceHolderImages.find(img => img.id === apt.clientImage) || PlaceHolderImages[0];
                const isOngoing = apt.status === 'ongoing';
                const isConfirmed = apt.status === 'confirmed';
                const isCompleted = apt.status === 'completed';

                return (
                  <div key={apt.id} className={`premium-card p-4 rounded-2xl flex items-center justify-between group ${isCompleted ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-secondary border border-white/5 overflow-hidden relative shrink-0">
                        {cImg && <Image src={cImg.imageUrl} alt="Client" fill className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-foreground truncate">{apt.clientName}</h4>
                        <p className="text-[9px] text-muted-foreground truncate">{apt.serviceName} • {apt.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConfirmed || isOngoing ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteAppointment(apt)}
                          className="h-7 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary text-[8px] font-black uppercase tracking-widest transition-all"
                        >
                          <Check size={10} className="mr-1" />
                          Concluir
                        </Button>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border bg-secondary/30 text-muted-foreground border-white/10">
                          {isCompleted ? 'Concluído' : 'Cancelado'}
                        </span>
                      )}
                      <button className="text-muted-foreground p-1"><MoreVertical size={16} /></button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-muted-foreground py-10">Nenhum agendamento encontrado.</p>
            )}
          </div>
        </section>

        {/* Insight Card */}
        <section className="pb-4">
          <div className="premium-card p-6 rounded-3xl flex items-center justify-between group">
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Fidelidade Total</h4>
              <p className="text-xl font-black text-white leading-tight">Clientes com<br/>pontos ativos</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">12</span>
                <span className="text-[10px] text-muted-foreground font-bold"> usuários</span>
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-secondary/50" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary drop-shadow-[0_0_8px_rgba(255,191,0,0.3)]" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213.6" strokeDashoffset="60" strokeWidth="8" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">72%</div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
