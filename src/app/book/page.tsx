
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { X, CheckCircle, Scissors, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, getDocs, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { format, addDays, isSameDay, parse, addMinutes, isAfter, isBefore, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sendPushNotification } from '@/app/actions/send-push';

// Lista de feriados nacionais fixos (MM-DD)
const FERIADOS = [
  '01-01', // Ano Novo
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciência Negra
  '12-25', // Natal
];

const isHoliday = (date: Date) => {
  const dateStr = format(date, 'MM-dd');
  return FERIADOS.includes(dateStr);
};

export default function BookPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const servicesQuery = useMemo(() => db ? query(collection(db, 'services'), orderBy('name')) : null, [db]);
  const { data: services = [], loading: servicesLoading } = useCollection(servicesQuery);

  const barbersQuery = useMemo(() => db ? query(collection(db, 'barbers'), orderBy('name')) : null, [db]);
  const { data: barbers = [], loading: barbersLoading } = useCollection(barbersQuery);

  useEffect(() => {
    if (!barbersLoading && barbers.length > 0) {
      const activeBarbers = barbers.filter((b: any) => b.status === 'active');
      if (activeBarbers.length === 1) {
        setSelectedBarber(activeBarbers[0]);
      }
    }
  }, [barbers, barbersLoading]);

  const settingsRef = useMemo(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: settings } = useDoc(settingsRef);

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

  const availableDates = useMemo(() => {
    if (typeof window === 'undefined') return [];
    
    const dates: Date[] = [];
    let current = new Date();
    let attempts = 0;

    // Gerar os próximos 14 dias úteis (pula Domingos e Feriados)
    while (dates.length < 14 && attempts < 45) {
      const dayOfWeek = getDay(current);
      const isSun = dayOfWeek === 0;
      const isHol = isHoliday(current);

      if (!isSun && !isHol) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
      attempts++;
    }

    return dates;
  }, []);

  // Se o dia atual for domingo/feriado, seleciona o primeiro dia disponível da lista
  useEffect(() => {
    if (availableDates.length > 0) {
      const isCurrentClosed = getDay(selectedDate) === 0 || isHoliday(selectedDate);
      if (isCurrentClosed) {
        setSelectedDate(availableDates[0]);
      }
    }
  }, [availableDates, selectedDate]);

  const timeSlots = useMemo(() => {
    if (!selectedBarber || !settings || !currentTime) return [];

    const slots: string[] = [];
    const interval = settings.appointmentInterval || 30;
    
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
      
      const isBreak = breakStart && breakEnd && 
                      (isAfter(current, breakStart) || timeStr === format(breakStart, 'HH:mm')) && 
                      isBefore(current, breakEnd);

      const isBooked = bookedAppointments.some((apt: any) => apt.time === timeStr);

      let isPast = false;
      if (isToday) {
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

      const notificationTitle = "Novo Agendamento";
      const notificationMessage = `${user.displayName} solicitou ${selectedService.name} para o dia ${format(selectedDate, 'dd/MM')} às ${selectedTime}.`;

      await addDoc(collection(db, 'notifications'), {
        title: notificationTitle,
        message: notificationMessage,
        createdAt: new Date().toISOString(),
        read: false,
        type: 'info',
        recipientRole: 'admin'
      });

      const adminQuery = query(collection(db, 'users'), where('email', '==', 'admin@gmail.com'), limit(1));
      const adminSnap = await getDocs(adminQuery);
      if (!adminSnap.empty) {
        const adminData = adminSnap.docs[0].data();
        if (adminData.fcmToken) {
          sendPushNotification(adminData.fcmToken, notificationTitle, notificationMessage, '/admin');
        }
      }

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

  if (!mounted) return null;

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
                  <p className="text-[10px] text-muted-foreground mt-1">R$ {Number(service.price).toFixed(2)}</p>
                </div>
                {selectedService?.id === service.id && <CheckCircle className="text-primary" size={20} />}
              </div>
            ))}
          </div>
        </section>

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

        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <CalendarIcon className="text-primary" size={20} />
              Escolha a Data
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-7">
              Aberto Seg a Sáb • Domingo e Feriados Fechado
            </p>
          </div>
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
                  <span className="text-[8px] font-bold uppercase opacity-60">
                    {format(date, 'EEE', { locale: ptBR })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Clock className="text-primary" size={20} />
            Horários Disponíveis
          </h3>
          {!selectedBarber ? (
            <div className="bg-secondary/20 p-8 rounded-2xl border border-dashed border-white/5 text-center">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Selecione um barbeiro</p>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-4 rounded-xl border font-bold text-sm transition-all ${selectedTime === time ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/30 border-white/5 text-muted-foreground'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-secondary/20 p-8 rounded-2xl border border-dashed border-white/5 text-center">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Nenhum horário disponível</p>
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
