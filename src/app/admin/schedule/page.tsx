"use client"

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Calendar as CalendarIcon, ChevronDown, User, TrendingUp, DollarSign, Users } from 'lucide-react';
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
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const appointmentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'appointments'),
      where('date', '==', dateString)
    );
  }, [db, dateString]);

  const { data: appointments = [] } = useCollection(appointmentsQuery);

  const getAppointmentsForHour = (hour: string) => {
    return appointments.filter((apt: any) => apt.time === hour);
  };

  const totalRevenue = appointments.reduce((acc: number, curr: any) => acc + (curr.price || 85), 0);

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <main className="pt-24 px-4 space-y-8">
        {/* Header & Filters */}
        <section className="flex flex-col gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tighter">Agenda Geral</h2>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="h-11 flex-1 rounded-xl bg-card border border-white/5 flex items-center justify-between gap-2 font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} />
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
              className="h-11 px-6 rounded-xl bg-card border border-white/5 font-bold text-xs"
            >
              Hoje
            </Button>
          </div>
        </section>

        {/* Timeline Grid */}
        <section className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {hours.map((hour) => {
              const hourAppointments = getAppointmentsForHour(hour);
              const isLunch = hour === '13:00';
              
              return (
                <div key={hour} className="flex min-h-[90px] hover:bg-white/[0.01] transition-colors group">
                  <div className="w-16 flex flex-col items-center justify-start pt-4 border-r border-white/5 bg-secondary/10 shrink-0">
                    <span className="text-lg font-black text-primary leading-none tracking-tighter">{hour}</span>
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                      {parseInt(hour) < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-3 flex gap-4 overflow-x-auto hide-scrollbar items-center">
                    {isLunch ? (
                      <div className="w-full h-12 border border-dashed border-white/5 rounded-xl flex items-center justify-center">
                        <span className="text-muted-foreground/30 italic text-[10px] font-medium">Intervalo Geral</span>
                      </div>
                    ) : hourAppointments.length > 0 ? (
                      hourAppointments.map((apt: any) => (
                        <div key={apt.id} className="min-w-[200px] h-14 bg-secondary/40 border-l-2 border-primary p-3 rounded-xl flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[9px] font-black text-foreground uppercase tracking-widest truncate">{apt.serviceName}</h4>
                            <p className="text-[8px] font-bold text-primary mt-0.5 truncate">{apt.clientName}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-12 rounded-xl border border-dashed border-white/5 flex items-center justify-center p-3 opacity-30">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Livre</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 gap-3">
          <div className="premium-card p-4 rounded-2xl flex flex-col justify-between h-28 col-span-2">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Faturamento do Dia</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-primary">R$ {totalRevenue}</span>
              <DollarSign className="text-primary" size={20} />
            </div>
          </div>
          
          <div className="premium-card p-4 rounded-2xl flex flex-col justify-between h-28">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ocupação</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-white">
                {hours.length > 0 ? Math.round((appointments.length / hours.length) * 100) : 0}%
              </span>
              <TrendingUp className="text-muted-foreground" size={16} />
            </div>
          </div>
          
          <div className="premium-card p-4 rounded-2xl flex flex-col justify-between h-28">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Clientes</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-black text-white">{appointments.length}</span>
              <Users className="text-muted-foreground" size={16} />
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
