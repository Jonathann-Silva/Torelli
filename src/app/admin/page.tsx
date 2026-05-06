"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TrendingUp, Users, Calendar, DollarSign, MoreVertical, CheckCircle2 } from 'lucide-react';
import { APPOINTMENTS } from '@/lib/mock-data';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <main className="pt-20 px-5 space-y-10">
        <section className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tighter leading-none">Visão Geral</h2>
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-widest">Performance de hoje</p>
        </section>

        {/* Summary Grid - Single Column for Mobile Only View */}
        <section className="grid grid-cols-1 gap-4">
          <div className="premium-card p-6 rounded-3xl h-36 flex flex-col justify-between relative overflow-hidden group">
            <DollarSign className="absolute -right-2 -top-2 opacity-5" size={80} />
            <div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Faturamento</span>
              <h3 className="text-3xl font-black text-primary mt-1">R$ 1.450</h3>
            </div>
            <div className="flex items-center gap-1 text-primary font-bold text-[9px]">
              <TrendingUp size={12} />
              <span className="uppercase tracking-widest">+12% vs ontem</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="premium-card p-5 rounded-3xl h-36 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Agenda</span>
                <h3 className="text-3xl font-black text-white mt-1">18</h3>
              </div>
              <div className="text-muted-foreground font-bold text-[8px] uppercase tracking-tighter">
                8 slots livres
              </div>
            </div>

            <div className="premium-card p-5 rounded-3xl h-36 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Novos</span>
                <h3 className="text-3xl font-black text-white mt-1">5</h3>
              </div>
              <div className="flex items-center gap-1 text-primary font-bold text-[8px]">
                <CheckCircle2 size={10} />
                <span className="uppercase tracking-tighter">Meta ok</span>
              </div>
            </div>
          </div>
        </section>

        {/* Next Appointments */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-black text-white tracking-tight leading-none">Próximos Clientes</h2>
            <button className="text-[10px] font-black text-primary uppercase border-b border-primary/30 tracking-widest pb-0.5">Ver Tudo</button>
          </div>
          
          <div className="space-y-3">
            {APPOINTMENTS.map((apt) => {
              const cImg = PlaceHolderImages.find(img => img.id === apt.clientImage);
              return (
                <div key={apt.id} className="premium-card p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-white/5 overflow-hidden relative shrink-0">
                      {cImg && <Image src={cImg.imageUrl} alt="Client" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-foreground truncate">{apt.clientName}</h4>
                      <p className="text-[9px] text-muted-foreground truncate">{apt.serviceName} • {apt.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                      apt.status === 'ongoing' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/30 text-muted-foreground border-white/10'
                    }`}>
                      {apt.status === 'ongoing' ? 'Agora' : 'OK'}
                    </span>
                    <button className="text-muted-foreground"><MoreVertical size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Insight Card */}
        <section className="pb-4">
          <div className="premium-card p-6 rounded-3xl flex items-center justify-between group">
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">Meta Mensal</h4>
              <p className="text-xl font-black text-white leading-tight">1.000<br/>cortes</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">842</span>
                <span className="text-[10px] text-muted-foreground font-bold">/ 1k</span>
              </div>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-secondary/50" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary drop-shadow-[0_0_8px_rgba(255,191,0,0.3)]" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213.6" strokeDashoffset="34.2" strokeWidth="8" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">84%</div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
