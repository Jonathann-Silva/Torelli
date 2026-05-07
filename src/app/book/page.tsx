
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { X, CheckCircle, Clock, Scissors, Sun, Moon, CloudSun } from 'lucide-react';
import { BARBERS, SERVICES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BookPage() {
  const [selectedBarber, setSelectedBarber] = useState(BARBERS[0].id);
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTime, setSelectedTime] = useState('15:00');

  return (
    <div className="min-h-screen">
      <header className="bg-background/80 backdrop-blur-md text-primary flex justify-between items-center px-4 md:px-margin h-16 w-full z-50 border-b border-white/5 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <X size={24} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
          </Link>
          <h1 className="font-headline text-xl font-extrabold tracking-tighter text-primary">Torelli Agendamentos</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'client1')?.imageUrl || ''} 
            alt="User" 
            fill 
            className="object-cover"
          />
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-8 space-y-12 pb-40">
        {/* Service Summary Section */}
        <section className="bg-secondary/30 border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-primary/30 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Serviço Selecionado</span>
            <h2 className="text-2xl font-black text-primary tracking-tight">Corte & Barba Premium</h2>
            <p className="text-sm font-medium text-muted-foreground">60 min • R$ 120,00</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Scissors size={24} />
          </div>
        </section>

        {/* Step 1: Barber Selection */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">1</span>
            <h3 className="text-xl font-black text-white">Selecione o Barbeiro</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {BARBERS.filter(b => b.status === 'active' || b.id === 'b2').map((barber) => {
              const bImg = PlaceHolderImages.find(img => img.id === barber.image);
              const isSelected = selectedBarber === barber.id;
              return (
                <div 
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber.id)}
                  className={`premium-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer relative overflow-hidden ${isSelected ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/50' : ''}`}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5">
                    {bImg && (
                      <Image 
                        src={bImg.imageUrl} 
                        alt={barber.name} 
                        fill 
                        className={`object-cover ${!isSelected ? 'grayscale' : ''}`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground leading-none">{barber.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{barber.specialty}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="text-primary fill-primary-foreground" size={24} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 2: Date Selection */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">2</span>
            <h3 className="text-xl font-black text-white">Escolha a Data</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {[14, 15, 16, 17, 18, 19].map((day) => {
              const isSelected = selectedDate === day;
              const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
              return (
                <div 
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center min-w-[72px] h-24 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-primary/50 bg-primary/10 text-primary ring-1 ring-primary/50' : 'border-white/5 bg-secondary/30 text-muted-foreground hover:border-primary/30'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{days[day - 14]}</span>
                  <span className="text-2xl font-black mt-1">{day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Time Selection */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">3</span>
            <h3 className="text-xl font-black text-white">Horários Disponíveis</h3>
          </div>

          {[
            { label: 'Manhã', icon: Sun, times: ['09:00', '10:00', '11:00'], unavailable: ['11:00'] },
            { label: 'Tarde', icon: CloudSun, times: ['14:00', '15:00', '16:00', '17:00', '18:00'], unavailable: [] },
            { label: 'Noite', icon: Moon, times: ['19:00', '20:00'], unavailable: [] }
          ].map((period) => (
            <div key={period.label} className="space-y-4">
              <div className="flex items-center gap-2 opacity-50 ml-1">
                <period.icon size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{period.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {period.times.map((time) => {
                  const isSelected = selectedTime === time;
                  const isUnavailable = period.unavailable.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isUnavailable}
                      onClick={() => setSelectedTime(time)}
                      className={`py-4 rounded-xl border font-bold text-sm transition-all ${
                        isUnavailable ? 'opacity-20 cursor-not-allowed border-white/5' :
                        isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105' :
                        'bg-secondary/30 border-white/5 text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-white/5 p-6 z-50">
        <div className="max-w-[600px] mx-auto space-y-4">
          <Button className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-black text-lg uppercase tracking-widest amber-glow shadow-2xl hover:brightness-110 active:scale-95 transition-all">
            Confirmar Agendamento
          </Button>
          <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Você receberá uma confirmação via WhatsApp.</p>
        </div>
      </div>
    </div>
  );
}
