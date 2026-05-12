
"use client"

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UserPlus, Edit3, Settings, Coffee, Scissors, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function BarbersAdminPage() {
  const db = useFirestore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [activeSettingField, setActiveSettingField] = useState<'interval' | 'cleaning' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    schedule: 'Seg - Sex, 09:00 - 19:00',
    break: '12:30 - 13:30',
    status: 'active',
    image: 'barber1'
  });

  // Global settings state
  const [globalSettings, setGlobalSettings] = useState({
    appointmentInterval: 15,
    cleaningDuration: 10,
    emergencyReservation: true
  });
  
  const [tempValue, setTempValue] = useState<number>(0);

  const barbersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'barbers'), orderBy('name', 'asc'));
  }, [db]);

  const { data: barbers = [], loading } = useCollection(barbersQuery);

  const handleAddBarber = async () => {
    if (!db) return;
    if (!formData.name || !formData.specialty) {
      toast({ title: "Erro", description: "Nome e especialidade são obrigatórios.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      addDoc(collection(db, 'barbers'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        specialty: '',
        schedule: 'Seg - Sex, 09:00 - 19:00',
        break: '12:30 - 13:30',
        status: 'active',
        image: 'barber1'
      });
      
      toast({ title: "Sucesso", description: "Barbeiro adicionado com sucesso!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível adicionar o barbeiro.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const openSettingsDialog = (field: 'interval' | 'cleaning') => {
    setActiveSettingField(field);
    setTempValue(field === 'interval' ? globalSettings.appointmentInterval : globalSettings.cleaningDuration);
    setIsSettingsDialogOpen(true);
  };

  const handleSaveSetting = () => {
    if (activeSettingField === 'interval') {
      setGlobalSettings(prev => ({ ...prev, appointmentInterval: tempValue }));
    } else if (activeSettingField === 'cleaning') {
      setGlobalSettings(prev => ({ ...prev, cleaningDuration: tempValue }));
    }
    setIsSettingsDialogOpen(false);
    toast({ 
      title: "Configuração Atualizada", 
      description: "O tempo global foi atualizado com sucesso." 
    });
  };

  const toggleEmergency = () => {
    setGlobalSettings(prev => ({
      ...prev,
      emergencyReservation: !prev.emergencyReservation
    }));
    toast({ 
      title: globalSettings.emergencyReservation ? "Reserva Desativada" : "Reserva Ativada",
      description: "A configuração de reserva de emergência foi alterada."
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 md:px-margin max-w-container-max mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Gestão de Barbeiros</h2>
            <p className="text-muted-foreground text-sm font-medium">Gerencie sua equipe, horários e disponibilidade.</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground h-12 px-8 rounded-xl font-black uppercase tracking-widest amber-glow shadow-2xl">
                <UserPlus size={20} className="mr-2" />
                Adicionar Barbeiro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-foreground rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">Novo Barbeiro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome do Profissional</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: João Silva" 
                    className="bg-secondary/50 border-white/5 rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Especialidade</Label>
                  <Input 
                    value={formData.specialty} 
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    placeholder="Ex: Cortes Modernos & Fade" 
                    className="bg-secondary/50 border-white/5 rounded-xl h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horário</Label>
                    <Input 
                      value={formData.schedule} 
                      onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                      placeholder="Ex: Seg-Sex, 09h-19h" 
                      className="bg-secondary/50 border-white/5 rounded-xl h-12 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intervalo</Label>
                    <Input 
                      value={formData.break} 
                      onChange={(e) => setFormData({...formData, break: e.target.value})}
                      placeholder="Ex: 12h-13h" 
                      className="bg-secondary/50 border-white/5 rounded-xl h-12 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avatar de Referência</Label>
                  <Select onValueChange={(val) => setFormData({...formData, image: val})} defaultValue={formData.image}>
                    <SelectTrigger className="bg-secondary/50 border-white/5 rounded-xl h-12">
                      <SelectValue placeholder="Selecione um avatar" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="barber1">Avatar Clássico</SelectItem>
                      <SelectItem value="barber2">Avatar Moderno</SelectItem>
                      <SelectItem value="barber3">Avatar Sênior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddBarber} 
                  disabled={isSaving}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : "Salvar Barbeiro"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : barbers.length > 0 ? (
            barbers.map((barber: any) => {
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
            })
          ) : (
            <div className="col-span-full py-20 text-center opacity-30">
              <Scissors size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">Nenhum barbeiro cadastrado</p>
            </div>
          )}
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
            {/* Interval Setting Card */}
            <div className="bg-card/50 p-6 rounded-2xl border border-white/5 space-y-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tempo entre Agendamentos</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-primary">{globalSettings.appointmentInterval} min</span>
                <button 
                  onClick={() => openSettingsDialog('interval')}
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* Cleaning Duration Card */}
            <div className="bg-card/50 p-6 rounded-2xl border border-white/5 space-y-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Duração de Limpeza</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-primary">{globalSettings.cleaningDuration} min</span>
                <button 
                  onClick={() => openSettingsDialog('cleaning')}
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* Emergency Reservation Card */}
            <div className="bg-card/50 p-6 rounded-2xl border border-white/5 space-y-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Reserva de Emergência</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-primary">{globalSettings.emergencyReservation ? 'Ativado' : 'Desativado'}</span>
                <div 
                  onClick={toggleEmergency}
                  className={cn(
                    "w-10 h-5 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300",
                    globalSettings.emergencyReservation ? "bg-primary justify-end" : "bg-secondary justify-start"
                  )}
                >
                  <div className="w-3 h-3 bg-primary-foreground rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Global Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-foreground rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">
                {activeSettingField === 'interval' ? 'Tempo entre Agendamentos' : 'Duração de Limpeza'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {activeSettingField === 'interval' ? 'Minutos entre cada horário' : 'Minutos para higienização'}
                </Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number"
                    value={tempValue} 
                    onChange={(e) => setTempValue(parseInt(e.target.value) || 0)}
                    className="bg-secondary/50 border-white/5 rounded-xl h-12 flex-1"
                  />
                  <span className="text-xs font-bold text-muted-foreground">min</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSaveSetting} 
                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl"
              >
                Salvar Configuração
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <BottomNav />
    </div>
  );
}
