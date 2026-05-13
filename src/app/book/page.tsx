
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { X, CheckCircle, Scissors, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { format, addDays, isSameDay, parse, addMinutes, isAfter, isBefore, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BookPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update current time every minute to keep the slots "real-time"
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Services
  const servicesQuery = useMemo(() => db ? query(collection(db, 'services'), orderBy('name')) : null, [db]);
  const { data: services = [], loading: servicesLoading } = useCollection(servicesQuery);

  // Fetch Barbers
  const barbersQuery = useMemo(() => db ? query(collection(db, 'barbers'), orderBy('name')) : null, [db]);
  const { data: barbers = [], loading: barbersLoading } = useCollection(barbersQuery);

  // Auto-select barber if only one is active
  useEffect(() => {
    if (!barbersLoading && barbers.length > 0) {
      const activeBarbers = barbers.filter((b: any) => b.status === 'active');
      if (activeBarbers.length === 1) {
        setSelectedBarber(activeBarbers[0]);
      }
    }
  }, [barbers, barbersLoading]);

  // Fetch Global Settings
  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

  // Fetch Existing Appointments for the selected date and barber to filter availability
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const appointmentsQuery = useMemo(() => {
    if (!db || !selectedBarber) return null;
    return query(
      collection(db, 'appointments'),
      where('barberName', '==', selectedBarber.name),
      where('date', '==', dateStr),
      where('status', 'not-in', ['cancelled'])
    );
  }, [db, selectedBarber, dateStr]);

  const { data: bookedAppointments = [] } = useCollection(appointmentsQuery);

  // Generate dynamic dates (next 14 days)
  const availableDates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));
  }, []);

  // Generate time slots based on barber schedule and global settings
  const timeSlots = useMemo(() => {
    if (!selectedBarber || !settings) return [];

    const slots: string[] = [];
    const interval = settings.appointmentInterval || 30; // Minutes from admin settings
    
    const scheduleMatch = selectedBarber.schedule?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    const breakMatch = selectedBarber.break?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);

    if (!scheduleMatch) return [];

    let current = parse(scheduleMatch[1], 'HH:mm', selectedDate);
    const end = parse(scheduleMatch[2], 'HH:mm', selectedDate);
    
    let breakStart = breakMatch ? parse(breakMatch[1], 'HH:mm', selectedDate) : null;
    let breakEnd = breakMatch ? parse(breakMatch[2], 'HH:mm', selectedDate) : null;

    const isToday = isSameDay(selectedDate, currentTime);

    while (isBefore(current, end)) {
      const timeStr = format(current, 'HH:mm');
      
      // Check if it's during break
      const isBreak = breakStart && breakEnd && 
                      (isAfter(current, breakStart) || timeStr === format(breakStart, 'HH:mm')) && 
                      isBefore(current, breakEnd);

      // Check if it's already booked
      const isBooked = bookedAppointments.some((apt: any) => apt.time === timeStr);

      // Check if time has already passed (if today)
      let isPast = false;
      if (isToday) {
        // We set the hours and minutes on the current slot relative to today to compare accurately
        const slotDate = new Date(selectedDate);
        const [hours, mins] = timeStr.split(':').map(Number);
        slotDate.setHours(hours, mins, 0, 0);
        
        isPast = isBefore(slotDate, currentTime);
      }

      if (!isBreak && !isBooked && !isPast) {
        slots.push(timeStr);
      }
      
      current = addMinutes(current, interval);
    }

    return slots;
  }, [selectedBarber, settings, bookedAppointments, selectedDate, currentTime]);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Atenção", description: "Você precisa estar logado para agendar." });
      return;
    }
    if (!selectedService || !selectedBarber || !selectedTime) {
      toast({ title: "Atenção", description: "Selecione serviço, barbeiro e horário." });
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        userId: user.uid,
        clientName: user.displayName || "Cliente",
        serviceName: selectedService.name,
        barberName: selectedBarber.name,
        date: dateStr,
        time: selectedTime,
        status: 'pending',
        price: selectedService.price,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      await addDoc(collection(db, 'notifications'), {
        title: "Novo Agendamento",
        message: `${user.displayName} solicitou ${selectedService.name} com ${selectedBarber.name} para o dia ${format(selectedDate, 'dd/MM')} às ${selectedTime}.`,
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
            {servicesLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
            ) : services.map((service: any) => (
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
                  <p className="text-[10px] text-muted-foreground mt-1">R$ {Number(service.price).toFixed(2)} • {service.duration} min</p>
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
            {barbersLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
            ) : barbers.filter((b: any) => b.status === 'active').map((barber: any) => (
              <div 
                key={barber.id}
                onClick={() => {
                  setSelectedBarber(barber);
                  setSelectedTime(''); 
                }}
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
            {availableDates.map((date) => {
              const isActive = isSameDay(selectedDate, date);
              return (
                <div 
                  key={date.toISOString()}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime(''); 
                  }}
                  className={`flex flex-col items-center justify-center min-w-[72px] h-24 rounded-2xl border transition-all cursor-pointer ${isActive ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-secondary/30 text-muted-foreground'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {format(date, 'MMM', { locale: ptBR })}
                  </span>
                  <span className="text-2xl font-black mt-1">{format(date, 'dd')}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Time Selection */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Clock className="text-primary" size={20} />
              Horários Disponíveis
            </h3>
            {selectedBarber && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Com {selectedBarber.name}
              </span>
            )}
          </div>
          
          {!selectedBarber ? (
            <div className="bg-secondary/20 p-8 rounded-2xl border border-dashed border-white/5 text-center">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Selecione um barbeiro primeiro</p>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-4 rounded-xl border font-bold text-sm transition-all ${selectedTime === time ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-secondary/30 border-white/5 text-muted-foreground'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-secondary/20 p-8 rounded-2xl border border-dashed border-white/5 text-center">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Nenhum horário disponível para esta data</p>
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-white/5 p-6 z-50">
        <div className="max-w-[600px] mx-auto">
          <Button 
            disabled={loading || !selectedService || !selectedBarber || !selectedTime}
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
