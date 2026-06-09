
"use client"

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Settings, Clock, Calendar, Loader2, Sparkles, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';

export default function AdminSettingsPage() {
  const db = useFirestore();
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeField, setActiveField] = useState<'interval' | 'cleaning' | 'combo' | null>(null);
  const [tempValue, setTempValue] = useState<number>(0);

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
      toast({ 
        title: "Configuração Atualizada", 
        description: "As alterações foram salvas com sucesso." 
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível salvar a configuração.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-5 space-y-10 max-w-[480px] mx-auto">
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-primary"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Configurações</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Ajustes Globais</h2>
          <p className="text-sm font-medium text-muted-foreground">Configure os intervalos e tempos padrão da barbearia.</p>
        </header>

        <section className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="premium-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
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
                  <div>
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
                  <div>
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

        <section className="bg-primary/5 border border-primary/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h4 className="text-xl font-black text-white tracking-tight">Dica de Gestão</h4>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Alterar o intervalo de tempo afetará apenas novos agendamentos. Os horários já marcados permanecerão inalterados.
            </p>
          </div>
          <Settings size={100} className="absolute -right-8 -bottom-8 text-primary/5 rotate-12 pointer-events-none" />
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
