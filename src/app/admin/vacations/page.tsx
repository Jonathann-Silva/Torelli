
"use client"

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PalmTree, Calendar as CalendarIcon, Loader2, Trash2, ChevronLeft, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, addDoc, deleteDoc, doc, getDocs, where, updateDoc } from 'firebase/firestore';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { sendPushNotification } from '@/app/actions/send-push';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function AdminVacationsPage() {
  const db = useFirestore();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [pendingDeactivation, setPendingDeactivation] = useState<Date | null>(null);
  const [conflictingApts, setConflictingApts] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const vacationsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'deactivatedDays'), orderBy('date', 'asc'));
  }, [db]);

  const { data: deactivatedDays = [], loading } = useCollection(vacationsQuery);

  const checkConflictsAndAdd = async (date: Date) => {
    if (!db) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if already deactivated
    if (deactivatedDays.some((d: any) => d.date === dateStr)) {
      toast({ title: "Data já desativada", description: "Este dia já consta como fechado." });
      return;
    }

    setIsProcessing(true);
    try {
      const q = query(collection(db, 'appointments'), where('date', '==', dateStr), where('status', 'in', ['pending', 'confirmed']));
      const snap = await getDocs(q);
      const conflicts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (conflicts.length > 0) {
        setConflictingApts(conflicts);
        setPendingDeactivation(date);
        setShowConfirmCancel(true);
      } else {
        await finalizeDeactivation(date);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao verificar conflitos.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeDeactivation = async (date: Date, notifyAll = false) => {
    if (!db) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, "dd 'de' MMMM", { locale: ptBR });

    try {
      // 1. Desativar o dia
      await addDoc(collection(db, 'deactivatedDays'), {
        date: dateStr,
        createdAt: new Date().toISOString()
      });

      // 2. Se houver conflitos, cancelar e notificar
      if (conflictingApts.length > 0) {
        for (const apt of conflictingApts) {
          await updateDoc(doc(db, 'appointments', apt.id), { status: 'cancelled' });
          
          const title = "Agendamento Cancelado";
          const message = `A barbearia estará fechada em ${displayDate}. Seu agendamento foi cancelado automaticamente.`;
          
          await addDoc(collection(db, 'notifications'), {
            title, message, createdAt: new Date().toISOString(), read: false, type: 'alert', recipientId: apt.userId, recipientRole: 'client'
          });

          if (apt.userId) {
            const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', apt.userId)));
            if (!userSnap.empty && userSnap.docs[0].data().fcmToken) {
              await sendPushNotification(userSnap.docs[0].data().fcmToken, title, message);
            }
          }
        }
      }

      // 3. Notificar todos se solicitado
      if (notifyAll) {
        const usersSnap = await getDocs(collection(db, 'users'));
        const title = "Aviso de Fechamento";
        const message = `Informamos que não haverá expediente no dia ${displayDate}. Confira outras datas disponíveis no app!`;
        
        usersSnap.docs.map(async (u) => {
          const userData = u.data();
          await addDoc(collection(db, 'notifications'), {
            title, message, createdAt: new Date().toISOString(), read: false, type: 'info', recipientId: u.id, recipientRole: 'client'
          });
          if (userData.fcmToken) {
            await sendPushNotification(userData.fcmToken, title, message);
          }
        });
      }

      toast({ title: "Dia Desativado!", description: `Calendário bloqueado para ${displayDate}.` });
      setShowConfirmCancel(false);
      setConflictingApts([]);
      setPendingDeactivation(null);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível desativar o dia.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'deactivatedDays', id));
      toast({ title: "Dia Reativado", description: "A data agora está disponível para agendamentos." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover a folga.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-5 space-y-10 max-w-[480px] mx-auto">
        <header className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
          </button>
          
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Folgas & Férias</h2>
            <p className="text-sm font-medium text-muted-foreground">Bloqueie datas específicas para evitar novos agendamentos.</p>
          </div>
        </header>

        <section className="space-y-6">
          <div className="premium-card p-6 rounded-3xl space-y-6 bg-secondary/20 border-white/5">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Selecione a Data</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="h-14 flex-1 rounded-xl bg-background/50 border border-white/5 flex items-center justify-between gap-2 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={18} className="text-primary" />
                        {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Escolher data'}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-white/5" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="bg-card text-foreground"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button 
                  disabled={!selectedDate || isProcessing}
                  onClick={() => selectedDate && checkConflictsAndAdd(selectedDate)}
                  className="w-14 h-14 bg-primary text-primary-foreground rounded-xl amber-glow shrink-0"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <CalendarIcon size={20} />}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest text-center">
                * Clientes não poderão agendar horários nesta data.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Datas Bloqueadas</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : deactivatedDays.length > 0 ? (
              deactivatedDays.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-4 bg-secondary/30 border border-white/5 rounded-2xl group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <PalmTree size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white">{d.date.split('-').reverse().join('/')}</span>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Loja Fechada</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(d.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
                <CalendarIcon size={40} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma folga agendada</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <AlertDialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-primary uppercase">Conflitos Encontrados!</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
              Existem {conflictingApts.length} agendamentos para este dia. Se você desativar a data, esses agendamentos serão <span className="text-destructive font-black">CANCELADOS</span> e os clientes notificados via Push.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[200px] overflow-y-auto space-y-2 p-2 bg-black/20 rounded-xl border border-white/5">
            {conflictingApts.map((apt, i) => (
              <div key={i} className="text-[10px] font-bold text-white uppercase flex justify-between">
                <span>{apt.clientName}</span>
                <span className="text-primary">{apt.time}</span>
              </div>
            ))}
          </div>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
              onClick={() => pendingDeactivation && finalizeDeactivation(pendingDeactivation, true)}
              className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-12 rounded-xl"
            >
              Confirmar & Notificar Todos
            </Button>
            <Button 
              variant="outline"
              onClick={() => pendingDeactivation && finalizeDeactivation(pendingDeactivation, false)}
              className="w-full border-white/10 text-white font-black uppercase tracking-widest h-12 rounded-xl"
            >
              Apenas Cancelar Conflitos
            </Button>
            <AlertDialogCancel className="w-full border-none text-muted-foreground uppercase text-[10px] font-black">Desistir</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
