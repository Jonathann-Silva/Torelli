"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Filter, Calendar, ChevronDown, User, Plus, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScheduleAdminPage() {
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 md:px-margin max-w-container-max mx-auto space-y-12">
        {/* Header & Filters */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tighter">Agenda Geral</h2>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Segunda-feira, 24 de Outubro</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="h-11 rounded-xl bg-card border border-white/5 flex items-center gap-2 font-bold text-xs">
              <Filter size={16} />
              Filtros
              <ChevronDown size={14} />
            </Button>
            <Button variant="secondary" className="h-11 rounded-xl bg-card border border-white/5 flex items-center gap-2 font-bold text-xs">
              <Calendar size={16} />
              Hoje
            </Button>
          </div>
        </section>

        {/* Timeline Grid */}
        <section className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {hours.map((hour, i) => {
              const isLunch = hour === '13:00';
              const isBusy = hour === '10:00' || hour === '12:00' || hour === '09:00';
              const isBlocked = hour === '10:00';
              
              return (
                <div key={hour} className="flex min-h-[110px] hover:bg-white/[0.01] transition-colors group">
                  <div className="w-20 md:w-32 flex flex-col items-center justify-start pt-6 border-r border-white/5 bg-secondary/20 relative">
                    {hour === '12:00' && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-l-full shadow-[0_0_15px_rgba(255,191,0,0.5)]"></div>}
                    <span className="text-xl font-black text-primary leading-none tracking-tighter">{hour}</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                      {parseInt(hour) < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-4 flex gap-6 overflow-x-auto hide-scrollbar items-center px-4">
                    {isLunch ? (
                      <div className="w-full h-16 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                        <span className="text-muted-foreground/30 italic text-xs font-medium">Intervalo Geral</span>
                      </div>
                    ) : isBlocked ? (
                      <div className="min-w-[240px] h-20 bg-destructive/5 border-l-4 border-destructive p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                          <Plus size={16} className="rotate-45" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-destructive">Bloqueado</h4>
                          <p className="text-[9px] font-bold text-muted-foreground mt-0.5">Manutenção</p>
                        </div>
                      </div>
                    ) : isBusy ? (
                      <div className="min-w-[260px] h-20 bg-secondary/50 border-l-4 border-primary p-4 rounded-2xl shadow-xl flex items-center gap-4 group/apt cursor-pointer hover:bg-secondary transition-all">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/apt:scale-110 transition-transform">
                          <User size={16} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest truncate max-w-[150px]">{hour === '09:00' ? 'Corte & Barba Elite' : hour === '10:00' ? 'Coloração Premium' : 'Corte Degradê'}</h4>
                          <p className="text-[9px] font-bold text-primary mt-0.5 truncate">Cliente: {hour === '09:00' ? 'Marcos Oliveira' : 'André Souza'}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Barbeiro: Victor K.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-[180px] h-20 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center p-4 group/slot cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <div className="text-center">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover/slot:text-primary">Disponível</p>
                          <p className="text-[8px] font-bold text-muted-foreground/50 uppercase mt-1">Livre</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Floating Actions */}
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-4">
          <Button variant="secondary" className="group h-12 w-12 rounded-full shadow-2xl bg-card border border-white/10 hover:bg-secondary transition-all active:scale-95">
            <Plus size={20} className="rotate-45 text-muted-foreground group-hover:text-destructive" />
          </Button>
          <Button className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
            <Plus size={24} />
          </Button>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="premium-card p-6 rounded-3xl flex flex-col justify-between h-36">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ocupação Hoje</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-primary">85%</span>
              <TrendingUp className="text-primary mb-1" size={20} />
            </div>
          </div>
          <div className="premium-card p-6 rounded-3xl flex flex-col justify-between h-36">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Novos Clientes</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-white">12</span>
              <Users className="text-muted-foreground mb-1" size={20} />
            </div>
          </div>
          <div className="bg-primary p-6 rounded-3xl flex flex-col justify-between h-36 shadow-xl shadow-primary/20">
            <p className="text-[9px] font-black text-primary-foreground uppercase tracking-[0.2em]">Faturamento Estimado</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-primary-foreground">R$ 2.450</span>
              <DollarSign className="text-primary-foreground mb-1" size={20} />
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}