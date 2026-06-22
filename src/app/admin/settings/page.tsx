
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Settings, Clock, Calendar, Loader2, Sparkles, Save, LogOut, Bell, ChevronRight, CheckCircle2, MessageSquare, PalmTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useAuth, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { requestAndSaveNotificationPermission } from '@/lib/pushNotifications';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';

export default function AdminSettingsPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  // States for global settings
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<'interval' | 'cleaning' | 'combo' | null>(null);
  const [tempValue, setTempValue] = useState<number>(0);
  
  // States for notifications
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied' | 'loading'>('loading');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const settingsRef = useMemo(() => doc(db, 'settings', 'global'), [db]);
  const { data: settingsData, loading } = useDoc(settingsRef);

  const globalSettings = {
    appointmentInterval: settingsData?.appointmentInterval || 15,
    cleaningDuration: settingsData?.cleaningDuration || 10,
    comboDuration: settingsData?.comboDuration || 60
  };

  const openSettingsDialog = (field: 'interval' | 'cleaning' | 'combo') => {
    setActiveField(field);
    if (field === 'interval') setTempValue(globalSettings.appointmentInterval);
    else if (field === 'cleaning') setTempValue(globalSettings.cleaningDuration);
    else if (field === 'combo') setTempValue(globalSettings.comboDuration);
    setIsDialogOpen(true);
  };

  const handleSaveSetting = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      const updatedSettings = { ...globalSettings };
      if (activeField === 'interval') updatedSettings.appointmentInterval = tempValue;
      else if (activeField === 'cleaning') updatedSettings.cleaningDuration = tempValue;
      else if (activeField === 'combo') updatedSettings.comboDuration = tempValue;

      await setDoc(doc(db, 'settings', 'global'), updatedSettings, { merge: true });
      setIsDialogOpen(false);
      toast({ title: "Configuração Atualizada", description: "As alterações foram salvas com sucesso." });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível salvar a configuração.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (!db || !user) return;
    setIsRegisteringPush(true);
    try {
      await requestAndSaveNotificationPermission(db, user.uid);
      setPushStatus(Notification.permission);
      toast({ title: "Push Ativado", description: "Você agora receberá alertas de novos agendamentos." });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao ativar notificações.", variant: "destructive" });
    } finally {
      setIsRegisteringPush(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({ title: "Erro ao sair", description: "Tente novamente.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-5 space-y-10 max-w-[480px] mx-auto">
        <header className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <div className="h-[1px] w-8 bg-primary"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Gestão Torelli</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Ajustes & Operação</h2>
          <p className="text-sm font-medium text-muted-foreground">Controle operacional e comunicação direta.</p>
        </header>

        {/* Notificações Push apenas para Admin */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Alertas do Sistema</h3>
          <button 
            disabled={pushStatus === 'granted' || isRegisteringPush}
            onClick={handleEnableNotifications}
            className="w-full flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all group amber-glow disabled:opacity-80"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {isRegisteringPush ? <Loader2 className="animate-spin" size={20} /> : <Bell size={20} />}
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-white uppercase tracking-tight">
                  {pushStatus === 'granted' ? 'Notificações Ativas' : 'Receber Alertas de Agendamentos'}
                </span>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                  {pushStatus === 'granted' ? 'Você já recebe avisos no celular.' : 'Ative para saber quando alguém agendar'}
                </p>
              </div>
            </div>
            {pushStatus === 'granted' ? <CheckCircle2 size={18} className="text-primary" /> : <ChevronRight size={18} className="text-primary" />}
          </button>
        </section>

        {/* Broadcast Messaging Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Ferramentas de Gestão</h3>
            <div className="h-px flex-grow bg-white/5"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/broadcast" className="block w-full">
              <button className="w-full flex items-center justify-between p-5 bg-secondary/30 border border-white/5 rounded-2xl hover:bg-secondary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black text-white uppercase tracking-tight">Comunicado Geral</span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Enviar avisos para todos os clientes</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronRight size={16} />
                </div>
              </button>
            </Link>

            <Link href="/admin/vacations" className="block w-full">
              <button className="w-full flex items-center justify-between p-5 bg-secondary/30 border border-white/5 rounded-2xl hover:bg-secondary/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <PalmTree size={24} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black text-white uppercase tracking-tight">Folgas & Férias</span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Desativar datas no calendário</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <ChevronRight size={16} />
                </div>
              </button>
            </Link>
          </div>
        </section>

        {/* Global Operational Settings */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Tempos de Operação</h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="premium-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Clock size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tempo de Corte</p>
                    <h4 className="text-xl font-black text-white mt-1">{globalSettings.appointmentInterval} min</h4>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => openSettingsDialog('interval')}
                  className="w-full bg-secondary/50 border border-white/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Alterar Intervalo
                </Button>
              </div>

              <div className="premium-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tempo de Barba</p>
                    <h4 className="text-xl font-black text-white mt-1">{globalSettings.cleaningDuration} min</h4>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => openSettingsDialog('cleaning')}
                  className="w-full bg-secondary/50 border border-white/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Alterar Duração
                </Button>
              </div>

              <div className="premium-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tempo de Combo</p>
                    <h4 className="text-xl font-black text-white mt-1">{globalSettings.comboDuration} min</h4>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => openSettingsDialog('combo')}
                  className="w-full bg-secondary/50 border border-white/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Alterar Combo
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="pt-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={18} />
            Sair da Conta Admin
          </button>
        </section>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-foreground rounded-3xl mx-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">
                {activeField === 'interval' ? 'Tempo de Corte' : 
                 activeField === 'cleaning' ? 'Tempo de Barba' : 'Tempo do Combo'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Minutos de duração
                </Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number"
                    value={tempValue} 
                    onChange={(e) => setTempValue(parseInt(e.target.value) || 0)}
                    className="bg-secondary/50 border-white/5 rounded-xl h-14 text-xl font-black"
                  />
                  <span className="text-xs font-bold text-muted-foreground uppercase">min</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSaveSetting} 
                disabled={isSaving}
                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl amber-glow"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <div className="flex items-center gap-2"><Save size={18} /> Salvar</div>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <BottomNav />
    </div>
  );
}
