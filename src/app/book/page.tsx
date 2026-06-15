
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

const FERIADOS = [
  '01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25',
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    setSelectedDate(new Date());
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

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const appointmentsQuery = useMemo(() => {
    if (!db || !selectedBarber || !dateStr) return null;
    return query(
      collection(db, 'appointments'),
      where('barberName', '==', selectedBarber.name),
      where('date', '==', dateStr),
      where('status', 'not-in', ['cancelled'])
    );
  }, [db, selectedBarber, dateStr]);

  const { data: bookedAppointments = [] } = useCollection(appointmentsQuery);

  const availableDates = useMemo(() => {
    if (!mounted) return [];
    const dates: Date[] = [];
    let current = new Date();
    while (dates.length < 14) {
      const dayOfWeek = getDay(current);
      if (dayOfWeek !== 0 && !isHoliday(current)) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }
    return dates;
  }, [mounted]);

  const timeSlots = useMemo(() => {
    if (!selectedBarber || !settings || !currentTime || !selectedDate) return [];
    const slots: string[] = [];
    const interval = settings.appointmentInterval || 30;
    const scheduleMatch = selectedBarber.schedule?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    if (!scheduleMatch) return [];
    let current = parse(scheduleMatch[1], 'HH:mm', selectedDate);
    const end = parse(scheduleMatch[2], 'HH:mm', selectedDate);
    const isToday = isSameDay(selectedDate, currentTime);
    while (isBefore(current, end)) {
      const timeStr = format(current, 'HH:mm');
      const isBooked = bookedAppointments.some((apt: any) => apt.time === timeStr);
      let isPast = false;
      if (isToday) {
        const slotDate = new Date(selectedDate);
        const [hours, mins] = timeStr.split(':').map(Number);
        slotDate.setHours(hours, mins, 0, 0);
        isPast = isBefore(slotDate, currentTime);
      }
      if (!isBooked && !isPast) slots.push(timeStr);
      current = addMinutes(current, interval);
    }
    return slots;
  }, [selectedBarber, settings, bookedAppointments, selectedDate, currentTime]);

  const handleConfirmBooking = async () => {
    if (!user || !selectedService || !selectedBarber || !selectedTime || !dateStr) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        clientName: user.displayName || "Cliente",
        serviceName: selectedService.name,
        barberName: selectedBarber.name,
        date: dateStr,
        time: selectedTime,
        status: 'pending',
        price: selectedService.price,
        createdAt: serverTimestamp()
      });

      const title = "Novo Agendamento";
      const message = `${user.displayName} solicitou ${selectedService.name} para o dia ${format(selectedDate!, 'dd/MM')} às ${selectedTime}.`;

      await addDoc(collection(db, 'notifications'), {
        title, message, createdAt: new Date().toISOString(), read: false, type: 'info', recipientRole: 'admin'
      });

      const adminSnap = await getDocs(query(collection(db, 'users'), where('email', '==', 'admin@gmail.com'), limit(1)));
      if (!adminSnap.empty && adminSnap.docs[0].data().fcmToken) {
        sendPushNotification(adminSnap.docs[0].data().fcmToken, title, message, '/admin');
      }

      toast({ title: "Solicitação Enviada!", description: "Aguarde a confirmação do barbeiro." });
      router.push('/appointments');
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível agendar." });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !selectedDate) return null;

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-background/80 backdrop-blur-md text-primary flex justify-between items-center px-4 h-16 w-full z-50 border-b border-white/5 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/"><X size={24} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" /></Link>
          <h1 className="font-headline text-xl font-extrabold tracking-tighter text-primary">Barbearia Torelli</h1>
        </div>
      </header>
      <main className="max-w-[600px] mx-auto px-4 py-8 space-y-12 pb-40">
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2"><Scissors className="text-primary" size={20} />Serviço</h3>
          <div className="grid grid-cols-1 gap-3">
            {servicesLoading ? <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div> : services.map((s: any) => (
              <div key={s.id} onClick={() => setSelectedService(s)} className={`premium-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer ${selectedService?.id === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}>
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"><Image src={s.image.startsWith('http') ? s.image : PlaceHolderImages.find(img => img.id === s.image)?.imageUrl || PlaceHolderImages[0].imageUrl} alt={s.name} fill className="object-cover" /></div>
                <div className="flex-1"><h4 className="text-sm font-bold text-foreground leading-none">{s.name}</h4><p className="text-[10px] text-muted-foreground mt-1">R$ {Number(s.price).toFixed(2)}</p></div>
                {selectedService?.id === s.id && <CheckCircle className="text-primary" size={20} />}
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white">Barbeiro</h3>
          <div className="grid grid-cols-1 gap-4">
            {barbersLoading ? <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div> : barbers.filter((b: any) => b.status === 'active').map((b: any) => (
              <div key={b.id} onClick={() => { setSelectedBarber(b); setSelectedTime(''); }} className={`premium-card p-4 rounded-2xl flex items-center gap-4 cursor-pointer ${selectedBarber?.id === b.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0"><Image src={b.image.startsWith('http') ? b.image : PlaceHolderImages.find(img => img.id === b.image)?.imageUrl || PlaceHolderImages[0].imageUrl} alt={b.name} fill className="object-cover" /></div>
                <div className="flex-1"><h4 className="text-lg font-bold text-foreground leading-none">{b.name}</h4><p className="text-xs text-muted-foreground mt-1">{b.specialty}</p></div>
                {selectedBarber?.id === b.id && <CheckCircle className="text-primary" size={24} />}
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2"><CalendarIcon className="text-primary" size={20} />Data</h3>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {availableDates.map((d) => {
              const isActive = isSameDay(selectedDate!, d);
              return (
                <div key={d.toISOString()} onClick={() => { setSelectedDate(d); setSelectedTime(''); }} className={`flex flex-col items-center justify-center min-w-[72px] h-24 rounded-2xl border cursor-pointer ${isActive ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-secondary/30 text-muted-foreground'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">{format(d, 'MMM', { locale: ptBR })}</span>
                  <span className="text-2xl font-black mt-1">{format(d, 'dd')}</span>
                  <span className="text-[8px] font-bold uppercase opacity-60">{format(d, 'EEE', { locale: ptBR })}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2"><Clock className="text-primary" size={20} />Horários</h3>
          {selectedBarber && timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)} className={`py-4 rounded-xl border font-bold text-sm ${selectedTime === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/30 border-white/5 text-muted-foreground'}`}>{t}</button>
              ))}
            </div>
          ) : <div className="bg-secondary/20 p-8 rounded-2xl border border-dashed border-white/5 text-center opacity-30"><p className="text-xs font-black uppercase tracking-widest">Nenhum horário disponível</p></div>}
        </section>
      </main>
      <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-white/5 p-6 z-50">
        <div className="max-w-[600px] mx-auto"><Button disabled={loading || !selectedService || !selectedBarber || !selectedTime} onClick={handleConfirmBooking} className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-black text-lg uppercase tracking-widest amber-glow shadow-2xl">{loading ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}</Button></div>
      </div>
    </div>
  );
}
