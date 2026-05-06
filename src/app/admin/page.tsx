"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TrendingUp, Users, Calendar, DollarSign, MoreVertical, CheckCircle2 } from 'lucide-react';
import { APPOINTMENTS } from '@/lib/mock-data';

export default function AdminDashboard() {
  const userImg = PlaceHolderImages.find(img => img.id === 'manager');

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-12 px-4 md:px-margin max-w-container-max mx-auto space-y-12">
        <section className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tighter">Olá, Admin</h2>
          <p className="text-muted-foreground text-sm">Confira o desempenho da Elite Blade hoje.</p>
        </section>

        {/* Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-8 rounded-3xl h-44 flex flex-col justify-between relative overflow-hidden group">
            <DollarSign className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity" size={120} />
            <div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Faturamento Diário</span>
              <h3 className="text-4xl font-black text-primary mt-2">R$ 1.450</h3>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold text-[10px]">
              <TrendingUp size={14} />
              <span className="uppercase tracking-widest">+12% vs ontem</span>
            </div>
          </div>

          <div className="premium-card p-8 rounded-3xl h-44 flex flex-col justify-between relative overflow-hidden group">
            <Calendar className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity" size={120} />
            <div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Agendamentos</span>
              <h3 className="text-4xl font-black text-white mt-2">18</h3>
            </div>
            <div className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
              8 slots restantes para hoje
            </div>
          </div>

          <div className="premium-card p-8 rounded-3xl h-44 flex flex-col justify-between relative overflow-hidden group">
            <Users className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity" size={120} />
            <div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Novos Clientes</span>
              <h3 className="text-4xl font-black text-white mt-2">5</h3>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold text-[10px]">
              <CheckCircle2 size={14} />
              <span className="uppercase tracking-widest">Meta de hoje atingida</span>
            </div>
          </div>
        </section>

        {/* Next Appointments */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-black text-white tracking-tight">Próximos Agendamentos</h2>
            <button className="text-xs font-black text-primary uppercase border-b border-primary tracking-widest pb-1 hover:brightness-110 transition-all">Ver Agenda Completa</button>
          </div>
          
          <div className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/50 border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Horário</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Cliente</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Serviço</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Barbeiro</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {APPOINTMENTS.map((apt) => {
                    const cImg = PlaceHolderImages.find(img => img.id === apt.clientImage);
                    return (
                      <tr key={apt.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6 font-bold text-primary">{apt.time}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary border border-white/5 overflow-hidden relative shrink-0">
                              {cImg && <Image src={cImg.imageUrl} alt="Client" fill className="object-cover" />}
                            </div>
                            <span className="font-bold text-sm text-foreground">{apt.clientName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-muted-foreground">{apt.serviceName}</td>
                        <td className="px-8 py-6 text-sm text-muted-foreground">{apt.barberName}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            apt.status === 'ongoing' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/30 text-muted-foreground border-white/10'
                          }`}>
                            {apt.status === 'ongoing' ? 'Em Andamento' : 'Confirmado'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="text-muted-foreground hover:text-primary transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="premium-card p-10 rounded-3xl space-y-8">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Serviços Populares</h4>
            <div className="space-y-6">
              {[
                { name: 'Corte Degradê', p: 75 },
                { name: 'Barboterapia', p: 45 },
                { name: 'Pigmentação', p: 20 }
              ].map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{s.p}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${s.p}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-10 rounded-3xl flex items-center justify-between group">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Próxima Grande Meta</h4>
              <p className="text-2xl font-black text-white leading-tight">1.000 agendamentos<br/>no mês</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-primary">842</span>
                <span className="text-muted-foreground font-bold">/ 1.000</span>
              </div>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-secondary/50" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="12"></circle>
                <circle className="text-primary drop-shadow-[0_0_10px_rgba(255,191,0,0.3)]" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeDasharray="351.8" strokeDashoffset="56.2" strokeWidth="12" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">84%</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}