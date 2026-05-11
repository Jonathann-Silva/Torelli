
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { X, CheckCircle, Scissors, Sun, Moon, CloudSun, Loader2 } from 'lucide-react';
import { BARBERS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function BookPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(BARBERS[0].id);
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTime, setSelectedTime] = useState('15:00');

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Atenção", description: "Você precisa estar logado para agendar." });
      return;
    }

    setLoading(true);
    try {
      const barber = BARBERS.find(b => b.id === selectedBarber);
      
      // 1. Criar o agendamento
      const appointmentData = {
        userId: user.uid,
        clientName: user.displayName || "Cliente",
        serviceName: "Corte & Barba Premium",
        barberName: barber?.name || "Qualquer Barbeiro",
        date: `2024-10-${selectedDate}`,
        time: selectedTime,
        status: 'pending',
        clientImage: 'client1',
        price: 120,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      // 2. Criar notificação para o Admin
      await addDoc(collection(db, 'notifications'), {
        title: "Novo Agendamento",
        message: `${user.displayName} solicitou um horário para ${selectedTime} no dia ${selectedDate}.`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'info',
        recipientRole: 'admin'
      });

      toast({
        title: "Solicitação Enviada!",
        description: "Aguarde a confirmação do barbeiro nas suas notificações.",
      });

      router.push('/appointments');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao agendar",
        description: "Não foi possível processar sua solicitação."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-background/80 backdrop-blur-md text-primary flex justify-between items-center px-4 md:px-margin h-16 w-full z-50 border-b border-white/5 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <X size={24} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
          </Link>
          <h1 className="font-headline text-xl font-extrabold tracking-tighter text-primary">Barbearia Torelli</h1>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-8 space-y-12 pb-40">
        <section className="bg-secondary/30 border border-white/5 rounded-2xl p-6 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Serviço Selecionado</span>
            <h2 className="text-2xl font-black text-primary tracking-tight">Corte & Barba Premium</h2>
            <p className="text-sm font-medium text-muted-foreground">60 min • R$ 120,00</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Scissors size={24} />
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-black text-white">Selecione o Barbeiro</h3>
          <div className="grid grid-cols-1 gap-4">
            {BARBERS.filter(b => b.status === 'active').map((barber) => {
              const bImg = PlaceHolderImages.find(img => img.id === barber.image);
              const isSelected = selectedBarber === barber.id;
              return (
                <div 
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber.id)}
                  className={`premium-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer relative ${isSelected ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/50' : ''}`}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/5">
                    {bImg && <Image src={bImg.imageUrl} alt={barber.name} fill className={`object-cover ${!isSelected ? 'grayscale' : ''}`} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground leading-none">{barber.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{barber.specialty}</p>
                  </div>
                  {isSelected && <CheckCircle className="text-primary" size={24} />}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-black text-white">Escolha a Data</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {[14, 15, 16, 17, 18, 19].map((day) => {
              const isSelected = selectedDate === day;
              return (
                <div 
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center min-w-[72px] h-24 rounded-2xl border transition-all cursor-pointer ${isSelected ? 'border-primary/50 bg-primary/10 text-primary' : 'border-white/5 bg-secondary/30 text-muted-foreground'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">Out</span>
                  <span className="text-2xl font-black mt-1">{day}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="text-xl font-black text-white">Horários Disponíveis</h3>
          <div className="grid grid-cols-3 gap-3">
            {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-4 rounded-xl border font-bold text-sm transition-all ${selectedTime === time ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-secondary/30 border-white/5 text-muted-foreground'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-white/5 p-6 z-50">
        <div className="max-w-[600px] mx-auto">
          <Button 
            disabled={loading}
            onClick={handleConfirmBooking}
            className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-black text-lg uppercase tracking-widest amber-glow shadow-2xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}
          </Button>
        </div>
      </div>
    </div>
  );
}
