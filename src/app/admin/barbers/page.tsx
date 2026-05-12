
"use client"

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UserPlus, Edit3, Settings, Coffee, Scissors, Calendar, Sparkles, Loader2, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, setDoc, updateDoc } from 'firebase/firestore';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [activeSettingField, setActiveSettingField] = useState<'interval' | 'cleaning' | 'combo' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBarberId, setEditingBarberId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    schedule: 'Seg - Sex, 09:00 - 19:00',
    break: '12:30 - 13:30',
    status: 'active',
    image: 'barber1'
  });

  // Global settings from Firestore
  const settingsRef = useMemo(() => doc(db, 'settings', 'global'), [db]);
  const { data: settingsData, loading: settingsLoading } = useDoc(settingsRef);
  
  const [tempValue, setTempValue] = useState<number>(0);

  const globalSettings = {
    appointmentInterval: settingsData?.appointmentInterval || 15,
    cleaningDuration: settingsData?.cleaningDuration || 10,
    comboDuration: settingsData?.comboDuration || 60
  };

  const barbersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'barbers'), orderBy('name', 'asc'));
  }, [db]);

  const { data: barbers = [], loading: barbersLoading } = useCollection(barbersQuery);

  const handleOpenAdd = () => {
    setEditingBarberId(null);
    setFormData({
      name: '',
      specialty: '',
      schedule: 'Seg - Sex, 09:00 - 19:00',
      break: '12:30 - 13:30',
      status: 'active',
      image: 'barber1'
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (barber: any) => {
    setEditingBarberId(barber.id);
    setFormData({
      name: barber.name,
      specialty: barber.specialty,
      schedule: barber.schedule,
      break: barber.break,
      status: barber.status,
      image: barber.image
    });
    setIsAddDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBarber = async () => {
    if (!db) return;
    if (!formData.name || !formData.specialty) {
      toast({ title: "Erro", description: "Nome e especialidade são obrigatórios.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingBarberId) {
        await updateDoc(doc(db, 'barbers', editingBarberId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast({ title: "Sucesso", description: "Barbeiro atualizado com sucesso!" });
      } else {
        await addDoc(collection(db, 'barbers'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast({ title: "Sucesso", description: "Barbeiro adicionado com sucesso!" });
      }
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível salvar o barbeiro.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const openSettingsDialog = (field: 'interval' | 'cleaning' | 'combo') => {
    setActiveSettingField(field);
    if (field === 'interval') setTempValue(globalSettings.appointmentInterval);
    else if (field === 'cleaning') setTempValue(globalSettings.cleaningDuration);
    else if (field === 'combo') setTempValue(globalSettings.comboDuration);
    setIsSettingsDialogOpen(true);
  };

  const handleSaveSetting = async () => {
    if (!db) return;
    
    setIsSaving(true);
    try {
      const updatedSettings = { ...globalSettings };
      if (activeSettingField === 'interval') updatedSettings.appointmentInterval = tempValue;
      else if (activeSettingField === 'cleaning') updatedSettings.cleaningDuration = tempValue;
      else if (activeSettingField === 'combo') updatedSettings.comboDuration = tempValue;

      await setDoc(doc(db, 'settings', 'global'), updatedSettings, { merge: true });
      
      setIsSettingsDialogOpen(false);
      toast({ 
        title: "Configuração Atualizada", 
        description: "o tempo foi salvo" 
      });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível salvar a configuração.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const getBarberImage = (imageKey: string) => {
    if (imageKey.startsWith('data:') || imageKey.startsWith('http')) return imageKey;
    const found = PlaceHolderImages.find(img => img.id === imageKey);
    return found?.imageUrl || PlaceHolderImages[0].imageUrl;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 md:px-margin max-w-container-max mx-auto space-y-12">
        <header className="flex flex-col items-center text-center gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Gestão de Barbeiros</h2>
            <p className="text-muted-foreground text-sm font-medium">Gerencie sua equipe, horários e disponibilidade.</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground h-12 px-8 rounded-xl font-black uppercase tracking-widest amber-glow shadow-2xl">
                <UserPlus size={20} className="mr-2" />
                Adicionar Barbeiro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-foreground rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">
                  {editingBarberId ? "Editar Barbeiro" : "Novo Barbeiro"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2 flex flex-col items-center pb-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-24 h-24 rounded-2xl bg-secondary/50 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {formData.image ? (
                      <Image 
                        src={getBarberImage(formData.image)} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <Camera className="text-muted-foreground group-hover:text-primary" size={24} />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  </div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">Alterar Foto</Label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>

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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                  <Select onValueChange={(val: any) => setFormData({...formData, status: val})} value={formData.status}>
                    <SelectTrigger className="bg-secondary/50 border-white/5 rounded-xl h-12">
                      <SelectValue placeholder="Status do barbeiro" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSaveBarber} 
                  disabled={isSaving}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : (editingBarberId ? "Atualizar" : "Salvar Barbeiro")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {barbersLoading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : barbers.length > 0 ? (
            barbers.map((barber: any) => {
              const barberImg = getBarberImage(barber.image);
              const isActive = barber.status === 'active';
              
              return (
                <div key={barber.id} className={`premium-card p-8 rounded-3xl flex flex-col gap-6 ${!isActive ? 'opacity-80' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-24 h-24 rounded-2xl overflow-hidden relative border-2 ${isActive ? 'border-primary/20 shadow-xl shadow-primary/10' : 'border-white/10 grayscale'}`}>
                        <Image 
                          src={barberImg} 
                          alt={barber.name} 
                          fill 
                          className="object-cover"
                        />
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
                    <button 
                      onClick={() => handleOpenEdit(barber)}
                      className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                    >
                      <Edit3 size={20} />
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

                    <div className="flex items-center gap-3 bg-secondary/30 p-4 rounded-2xl border border-white/5">
                      <Coffee size={18} className="text-primary" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Intervalo: {barber.break}</span>
                    </div>
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

          {settingsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/50 p-6 rounded-2xl border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tempo de corte</p>
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

              <div className="bg-card/50 p-6 rounded-2xl border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tempo de barba</p>
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

              <div className="bg-card/50 p-6 rounded-2xl border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Combo</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">{globalSettings.comboDuration} min</span>
                  <button 
                    onClick={() => openSettingsDialog('combo')}
                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="bg-card border-white/10 text-foreground rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">
                {activeSettingField === 'interval' ? 'Tempo de corte' : 
                 activeSettingField === 'cleaning' ? 'Tempo de barba' : 'Tempo do Combo'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {activeSettingField === 'interval' ? 'Minutos entre cada horário' : 
                   activeSettingField === 'cleaning' ? 'Minutos para a barba' : 'Minutos para Cabelo + Barba'}
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
                disabled={isSaving}
                className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : "Salvar Configuração"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <BottomNav />
    </div>
  );
}
