
"use client"

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { X, CheckCircle, Scissors, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function BookPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedTime, setSelectedTime] = useState('15:00');

  // Fetch Services
  const servicesQuery = useMemo(() => db ? query(collection(db, 'services'), orderBy('name')) : null, [db]);
  const { data: services = [], loading: servicesLoading } = useCollection(servicesQuery);

  // Fetch Barbers
  const barbersQuery = useMemo(() => db ? query(collection(db, 'barbers'), orderBy('name')) : null, [db]);
  const { data: barbers = [], loading: barbersLoading } = useCollection(barbersQuery);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Atenção", description: "Você precisa estar logado para agendar." });
      return;
    }
    if (!selectedService || !selectedBarber) {
      toast({ title: "Atenção", description: "Selecione um serviço e um barbeiro." });
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        userId: user.uid,
        clientName: user.displayName || "Cliente",
        serviceName: selectedService.name,
        barberName: selectedBarber.name,
        date: `2024-10-${selectedDate}`, // Simplificado para o exemplo
        time: selectedTime,
        status: 'pending',
        price: selectedService.price,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      await addDoc(collection(db, 'notifications'), {
        title: "Novo Agendamento",
        message: `${user.displayName} solicitou ${selectedService.name} com ${selectedBarber.name} para as ${selectedTime}.`,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'info',
        recipientRole: 'admin'
      });

      toast({
        title: "Solicitação Enviada!",
        description: "Aguarde a confirmação do barbeiro.",
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

  const getImage = (imageKey: string) => {
    if (imageKey?.startsWith('data:') || imageKey?.startsWith('http')) return imageKey;
    const found = PlaceHolderImages.find(img => img.id === imageKey);
    return found?.imageUrl || PlaceHolderImages[0].imageUrl;
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
        {/* Service Selection */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Scissors className="text-primary" size={20} />
            Escolha o Serviço
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {servicesLoading ? <Loader2 className="animate-spin text-primary mx-auto" /> : 
             services.map((service: any) => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`premium-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer relative ${selectedService?.id === service.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <Image src={getImage(service.image)} alt={service.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground leading-none">{service.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">R$ {service.price.toFixed(2)} • {service.duration} min</p>
                </div>
                {selectedService?.id === service.id && <CheckCircle className="text-primary" size={20} />}
              </div>
            ))}
          </div>
        </section>

        {/* Barber Selection */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white">Selecione o Barbeiro</h3>
          <div className="grid grid-cols-1 gap-4">
            {barbersLoading ? <Loader2 className="animate-spin text-primary mx-auto" /> :
             barbers.filter((b: any) => b.status === 'active').map((barber: any) => (
              <div 
                key={barber.id}
                onClick={() => setSelectedBarber(barber)}
                className={`premium-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer relative ${selectedBarber?.id === barber.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={getImage(barber.image)} alt={barber.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-foreground leading-none">{barber.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{barber.specialty}</p>
                </div>
                {selectedBarber?.id === barber.id && <CheckCircle className="text-primary" size={24} />}
              </div>
            ))}
          </div>
        </section>

        {/* Date Selection */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="text-primary" size={20} />
            Escolha a Data
          </h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {[14, 15, 16, 17, 18, 19].map((day) => (
              <div 
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center justify-center min-w-[72px] h-24 rounded-2xl border transition-all cursor-pointer ${selectedDate === day ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-secondary/30 text-muted-foreground'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Out</span>
                <span className="text-2xl font-black mt-1">{day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Time Selection */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Clock className="text-primary" size={20} />
            Horários Disponíveis
          </h3>
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
            disabled={loading || !selectedService || !selectedBarber}
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
