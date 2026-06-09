
"use client"

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { UserPlus, Edit3, Coffee, Scissors, Sparkles, Loader2, Camera, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc } from 'firebase/firestore';
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
import { compressImage } from '@/lib/image-compressor';

export default function BarbersAdminPage() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [editingBarberId, setEditingBarberId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    schedule: 'Seg - Sex, 09:00 - 19:00',
    break: '12:30 - 13:30',
    status: 'active',
    image: 'barber1'
  });

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);
        setFormData({ ...formData, image: compressed });
        toast({ title: "Foto otimizada", description: "A imagem foi comprimida com sucesso." });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao processar imagem.", variant: "destructive" });
      } finally {
        setIsCompressing(false);
      }
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

  const getBarberImage = (imageKey: string) => {
    if (imageKey.startsWith('data:') || imageKey.startsWith('http')) return imageKey;
    const found = PlaceHolderImages.find(img => img.id === imageKey);
    return found?.imageUrl || PlaceHolderImages[0].imageUrl;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 space-y-10 max-w-[480px] mx-auto">
        <header className="flex flex-col items-center text-center gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Equipe de Barbeiros</h2>
            <p className="text-muted-foreground text-sm font-medium">Gerencie sua equipe, horários e disponibilidade.</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground h-12 px-8 rounded-xl font-black uppercase tracking-widest amber-glow shadow-2xl">
                <UserPlus size={20} className="mr-2" />
                Novo Profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-foreground rounded-3xl mx-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">
                  {editingBarberId ? "Editar Barbeiro" : "Novo Barbeiro"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2 flex flex-col items-center pb-2">
                  <div 
                    onClick={() => !isCompressing && fileInputRef.current?.click()}
                    className="group relative w-24 h-24 rounded-2xl bg-secondary/50 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {isCompressing ? (
                      <Loader2 className="animate-spin text-primary" size={24} />
                    ) : formData.image ? (
                      <Image 
                        src={getBarberImage(formData.image)} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <Camera className="text-muted-foreground group-hover:text-primary" size={24} />
                    )}
                  </div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary mt-2 cursor-pointer">
                    {isCompressing ? "Processando..." : "Alterar Foto"}
                  </Label>
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
                  disabled={isSaving || isCompressing}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : (editingBarberId ? "Atualizar" : "Salvar Barbeiro")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {barbersLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : barbers.length > 0 ? (
            barbers.map((barber: any) => {
              const barberImg = getBarberImage(barber.image);
              const isActive = barber.status === 'active';
              
              return (
                <div key={barber.id} className={cn(
                  "premium-card p-6 rounded-[2rem] flex flex-col gap-6",
                  !isActive && "opacity-60 grayscale-[0.5]"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl overflow-hidden relative border-2 shrink-0 transition-all",
                        isActive ? "border-primary shadow-[0_0_20px_rgba(255,191,0,0.1)]" : "border-white/10"
                      )}>
                        <Image 
                          src={barberImg} 
                          alt={barber.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className={cn(
                          "text-lg font-black tracking-tighter leading-none truncate",
                          isActive ? "text-primary" : "text-white/60"
                        )}>{barber.name}</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">{barber.specialty}</p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isActive ? "bg-primary animate-pulse" : "bg-destructive"
                          )}></span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            isActive ? "text-primary" : "text-destructive"
                          )}>
                            {isActive ? 'Ativo' : 'Indisponível'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenEdit(barber)}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all shrink-0"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>

                  <div className="h-px bg-white/5"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={12} className="text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Escala</span>
                      </div>
                      <span className="text-xs font-bold text-white truncate block">{barber.schedule}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Coffee size={12} className="text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Almoço</span>
                      </div>
                      <span className="text-xs font-bold text-white block">{barber.break}</span>
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
      </main>

      <BottomNav />
    </div>
  );
}
