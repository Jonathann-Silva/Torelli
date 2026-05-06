"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UserPlus, Edit3, Settings, Coffee, Scissors, Calendar } from 'lucide-react';
import { BARBERS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BarbersAdminPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-12 px-4 md:px-margin max-w-container-max mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Gestão de Barbeiros</h2>
            <p className="text-muted-foreground text-sm font-medium">Gerencie sua equipe, horários e disponibilidade.</p>
          </div>
          <Button className="bg-primary text-primary-foreground h-12 px-8 rounded-xl font-black uppercase tracking-widest amber-glow shadow-2xl">
            <UserPlus size={20} className="mr-2" />
            Adicionar Barbeiro
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {BARBERS.map((barber) => {
            const bImg = PlaceHolderImages.find(img => img.id === barber.image);
            const isActive = barber.status === 'active';
            
            return (
              <div key={barber.id} className={`premium-card p-8 rounded-3xl flex flex-col gap-6 ${!isActive ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden relative border-2 ${isActive ? 'border-primary/20 shadow-xl shadow-primary/10' : 'border-white/10 grayscale'}`}>
                      {bImg && (
                        <Image 
                          src={bImg.imageUrl} 
                          alt={barber.name} 
                          fill 
                          className="object-cover"
                          data-ai-hint={bImg.imageHint}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className={`text-2xl font-black tracking-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{barber.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{barber.specialty}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-destructive'}`}></span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-destructive'}`}>
                          {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    {isActive ? <Edit3 size={20} /> : <Settings size={20} />}
                  </button>
                </div>

                <div className="h-px bg-white/5"></div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Horários de Trabalho</span>
                    <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`}>{barber.schedule}</span>
                  </div>

                  <div className={`grid grid-cols-7 gap-2 ${!isActive ? 'opacity-30' : ''}`}>
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => {
                      const isWorking = i < 5;
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center justify-center h-10 rounded-xl text-[10px] font-black border transition-all ${
                            isWorking && isActive 
                            ? 'bg-primary/10 border-primary/20 text-primary' 
                            : 'bg-secondary/50 border-white/5 text-muted-foreground'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  {isActive ? (
                    <div className="flex items-center gap-3 bg-secondary/30 p-4 rounded-2xl border border-white/5">
                      <Coffee size={18} className="text-primary" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intervalo: {barber.break}</span>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-white/10 text-muted-foreground hover:text-primary hover:border-primary/50 text-xs font-bold uppercase tracking-widest">
                      Configurar Horários
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Settings Section */}
        <section className="bg-secondary/30 border border-white/5 rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={24} />
            </div>
            <h4 className="text-2xl font-black text-white tracking-tight">Configurações de Pausa Global</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Tempo entre Agendamentos', value: '15 min', icon: Scissors },
              { label: 'Duração de Limpeza', value: '10 min', icon: Sparkles },
              { label: 'Reserva de Emergência', value: 'Ativado', icon: Coffee, active: true }
            ].map((stat, i) => (
              <div key={i} className="bg-card/50 p-6 rounded-2xl border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{stat.label}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">{stat.value}</span>
                  {stat.active ? (
                    <div className="w-10 h-5 bg-primary rounded-full flex items-center justify-end px-1 cursor-pointer">
                      <div className="w-3 h-3 bg-primary-foreground rounded-full"></div>
                    </div>
                  ) : (
                    <Settings className="text-muted-foreground cursor-pointer" size={18} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}