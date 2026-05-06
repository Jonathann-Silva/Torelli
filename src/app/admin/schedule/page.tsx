
"use client"

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Calendar as CalendarIcon, ChevronDown, User, TrendingUp, DollarSign, Users, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function ScheduleAdminPage() {
  const db = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const appointmentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'appointments'),
      where('date', '==', dateString)
    );
  }, [db, dateString]);

  const { data: appointments = [], loading } = useCollection(appointmentsQuery);

  const getAppointmentsForHour = (hour: string) => {
    return appointments.filter((apt: any) => apt.time === hour);
  };

  const totalRevenue = appointments.reduce((acc: number, curr: any) => acc + (Number(curr.price) || 0), 0);

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <main className="pt-24 px-4 space-y-8">
        {/* Admin Title Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardList size={20} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-white tracking-tighter">Agenda Geral</h2>
              <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em]">Visão do Administrador</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="h-11 flex-1 rounded-xl bg-card border border-white/5 flex items-center justify-between gap-2 font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-primary" />
                    {format(selectedDate, 'dd/MM/yyyy')}
                  </div>
                  <ChevronDown size={14} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-white/5" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="bg-card text-foreground"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="secondary" 
              onClick={() => setSelectedDate(new Date())}
              className="h-11 px-4 rounded-xl bg-card border border-white/5 font-bold text-xs"
            >
              Hoje
            </Button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="premium-card p-4 rounded-2xl flex flex-col justify-between h-28 col-span-2 bg-primary/5 border-primary/10">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Faturamento do Dia</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-primary">R$ {totalRevenue.toFixed(2)}</span>
              <DollarSign className="text-primary opacity-50" size={20} />
            </div>
          </div>
          
          <div className="premium-card p-4 rounded-2xl flex flex-col justify-between h-24">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Ocupação</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-white">
                {hours.length > 0 ? Math.round((appointments.length / hours.length) * 100) : 0}%
              </span>
              <TrendingUp className="text-muted-foreground opacity-50" size={16} />
            </div>
          </div>
          
          <div className="premium-card p-4 rounded-2xl flex flex-col justify-between h-24">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Agendados</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-white">{appointments.length}</span>
              <Users className="text-muted-foreground opacity-50" size={16} />
            </div>
          </div>
        </section>

        {/* Timeline Grid */}
        <section className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {hours.map((hour) => {
              const hourAppointments = getAppointmentsForHour(hour);
              const isLunch = hour === '13:00';
              
              return (
                <div key={hour} className="flex min-h-[80px] hover:bg-white/[0.01] transition-colors group">
                  <div className="w-14 flex flex-col items-center justify-center border-r border-white/5 bg-secondary/10 shrink-0">
                    <span className="text-sm font-black text-primary leading-none tracking-tighter">{hour}</span>
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                      {parseInt(hour) < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-2 flex gap-3 overflow-x-auto hide-scrollbar items-center">
                    {isLunch ? (
                      <div className="w-full h-10 border border-dashed border-white/5 rounded-xl flex items-center justify-center">
                        <span className="text-muted-foreground/30 italic text-[9px] font-medium uppercase tracking-widest">Intervalo Geral</span>
                      </div>
                    ) : hourAppointments.length > 0 ? (
                      hourAppointments.map((apt: any) => (
                        <div key={apt.id} className="min-w-[180px] h-12 bg-secondary/40 border-l-2 border-primary p-2 rounded-xl flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={12} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[8px] font-black text-foreground uppercase tracking-widest truncate">{apt.serviceName}</h4>
                            <p className="text-[8px] font-bold text-primary mt-0.5 truncate">{apt.clientName}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-10 rounded-xl border border-dashed border-white/5 flex items-center justify-center opacity-30">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Livre</p>
                      </div>
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
