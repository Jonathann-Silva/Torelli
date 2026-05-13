
"use client"

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, Clock, Loader2, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const appointmentsQuery = useMemo(() => {
    if (!db) return null;
    // Filtramos pelo nome do cliente. Se o usuário estiver logado com Google, usamos o nome dele.
    const nameToFilter = user?.displayName || '';
    
    if (!nameToFilter) return null;

    // Definimos os status baseados na aba ativa
    const statusFilter = activeTab === 'upcoming' 
      ? ['confirmed', 'ongoing', 'pending'] 
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
              const formattedDate = apt.date ? apt.date.split('-').reverse().join('-') : '---';
              
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
                       apt.status === 'pending' ? 'Pendente' : 
                       apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                        <Calendar size={12} />
                        <span>Data</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formattedDate}</p>
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
            <div className="mt-8 pt-4">
              <Link href="/book">
                <Button className="w-full bg-primary text-primary-foreground h-16 rounded-2xl font-black text-lg uppercase tracking-widest amber-glow shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Plus size={24} />
                  Agendar Novo Horário
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
