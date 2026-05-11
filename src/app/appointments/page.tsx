
"use client"

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, Clock, Scissors, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function AppointmentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const appointmentsQuery = useMemo(() => {
    if (!db) return null;
    // Filtramos pelo nome do cliente. Se o usuário estiver logado com Google, usamos o nome dele.
    const nameToFilter = user?.displayName || 'Gabriel Martins';
    
    // Definimos os status baseados na aba ativa
    const statusFilter = activeTab === 'upcoming' 
      ? ['confirmed', 'ongoing'] 
      : ['completed', 'cancelled'];

    return query(
      collection(db, 'appointments'),
      where('clientName', '==', nameToFilter),
      where('status', 'in', statusFilter)
    );
  }, [db, user, activeTab]);

  const { data: appointments = [], loading, error } = useCollection(appointmentsQuery);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 md:px-margin max-w-container-max mx-auto space-y-8">
        <header className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tighter">Meus Agendamentos</h2>
          <p className="text-muted-foreground text-sm">Gerencie suas sessões de cuidado e estilo.</p>
        </header>

        <div className="flex gap-8 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              "pb-4 border-b-2 text-sm font-black uppercase tracking-widest transition-all",
              activeTab === 'upcoming' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Próximos
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "pb-4 border-b-2 text-sm font-black uppercase tracking-widest transition-all",
              activeTab === 'history' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Histórico
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Buscando seus agendamentos...</p>
            </div>
          ) : error ? (
            <div className="premium-card p-10 rounded-2xl flex flex-col items-center text-center gap-4">
              <AlertCircle className="text-destructive" size={40} />
              <p className="text-sm font-medium text-muted-foreground">Não foi possível carregar seus dados.</p>
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((apt: any) => {
              const barberImg = PlaceHolderImages.find(img => img.id === 'barber' + (apt.barberName?.includes('Marco') ? '3' : '1'));
              const isPast = apt.status === 'completed' || apt.status === 'cancelled';
              
              return (
                <div key={apt.id} className={cn(
                  "premium-card p-6 rounded-2xl flex flex-col gap-6 group hover:border-primary/40 transition-all",
                  isPast && "opacity-80"
                )}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary overflow-hidden relative border border-white/5">
                        {barberImg && (
                          <Image 
                            src={barberImg.imageUrl} 
                            alt="Barber" 
                            fill 
                            className="object-cover"
                            data-ai-hint={barberImg.imageHint}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Barbeiro</p>
                        <h3 className="text-xl font-bold text-primary leading-tight">{apt.barberName}</h3>
                      </div>
                    </div>
                    <Badge 
                      variant={apt.status === 'ongoing' ? 'default' : apt.status === 'cancelled' ? 'destructive' : 'secondary'} 
                      className="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest"
                    >
                      {apt.status === 'ongoing' ? 'Em Andamento' : 
                       apt.status === 'confirmed' ? 'Confirmado' : 
                       apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                        <Calendar size={12} />
                        <span>Data</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{apt.date}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={12} />
                        <span>Hora</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{apt.time}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Serviço</p>
                    <p className="text-lg font-black text-foreground">{apt.serviceName}</p>
                  </div>

                  {!isPast && (
                    <div className="flex gap-3 pt-2">
                      <Button variant="secondary" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs">Remarcar</Button>
                      <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs text-destructive border-destructive/20 hover:bg-destructive/10">Cancelar</Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
              <Calendar size={48} className="text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest">
                  {activeTab === 'upcoming' ? 'Nenhum agendamento' : 'Nenhum histórico'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'upcoming' 
                    ? 'Você ainda não possui horários marcados.' 
                    : 'Você ainda não possui serviços concluídos.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="mt-8 relative overflow-hidden bg-primary p-8 rounded-3xl flex flex-col items-center justify-between gap-6 group">
              <div className="relative z-10 space-y-4 text-center">
                <h4 className="text-3xl font-black text-primary-foreground leading-tight tracking-tight">Mantenha seu visual impecável.</h4>
                <p className="text-primary-foreground/80 font-medium text-sm">Assine nosso plano mensal e tenha prioridade na agenda.</p>
                <Button className="bg-primary-foreground text-primary px-8 h-12 rounded-xl font-black uppercase tracking-widest shadow-xl">Saber Mais</Button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Scissors size={240} className="rotate-12" />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
