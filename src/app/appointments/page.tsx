"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, Clock, MapPin, MoreHorizontal } from 'lucide-react';
import { APPOINTMENTS } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 md:px-margin max-w-container-max mx-auto space-y-8">
        <header className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tighter">Meus Agendamentos</h2>
          <p className="text-muted-foreground text-sm">Gerencie suas sessões de cuidado e estilo.</p>
        </header>

        <div className="flex gap-8 border-b border-white/5">
          <button className="pb-4 border-b-2 border-primary text-primary text-sm font-black uppercase tracking-widest">Próximos</button>
          <button className="pb-4 border-b-2 border-transparent text-muted-foreground text-sm font-black uppercase tracking-widest hover:text-foreground transition-colors">Histórico</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {APPOINTMENTS.map((apt) => {
            const barberImg = PlaceHolderImages.find(img => img.id === 'barber' + (apt.barberName.includes('Marcos') ? '3' : '1'));
            return (
              <div key={apt.id} className="premium-card p-6 rounded-2xl flex flex-col gap-6 group hover:border-primary/40 transition-all">
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
                  <Badge variant={apt.status === 'ongoing' ? 'default' : 'secondary'} className="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                    {apt.status === 'ongoing' ? 'Em Andamento' : 'Confirmado'}
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

                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs">Remarcar</Button>
                  <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs text-destructive border-destructive/20 hover:bg-destructive/10">Cancelar</Button>
                </div>
              </div>
            );
          })}

          <div className="lg:col-span-2 mt-8 relative overflow-hidden bg-primary p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 group">
            <div className="relative z-10 space-y-4 text-center md:text-left">
              <h4 className="text-3xl font-black text-primary-foreground leading-tight tracking-tight">Mantenha seu visual<br className="hidden md:block"/>sempre impecável.</h4>
              <p className="text-primary-foreground/80 font-medium text-sm">Assine nosso plano mensal e tenha prioridade na agenda.</p>
              <Button className="bg-primary-foreground text-primary px-8 h-12 rounded-xl font-black uppercase tracking-widest shadow-xl">Saber Mais</Button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Scissors size={240} className="rotate-12" />
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}