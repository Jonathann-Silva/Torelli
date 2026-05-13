
"use client"

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Plus, Edit3, Trash2, Clock, DollarSign, Sparkles, Loader2, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateServiceDescription } from '@/ai/flows/generate-service-description';
import { toast } from '@/hooks/use-toast';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
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
import { Textarea } from '@/components/ui/textarea';

export default function ServicesAdminPage() {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 50,
    image: 'service-cut'
  });

  const servicesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'services'), orderBy('name', 'asc'));
  }, [db]);

  const { data: services = [], loading } = useCollection(servicesQuery);

  const handleOpenAdd = () => {
    setEditingServiceId(null);
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 50,
      image: 'service-cut'
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: any) => {
    setEditingServiceId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      image: service.image
    });
    setIsDialogOpen(true);
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

  const handleSaveService = async () => {
    if (!db) return;
    if (!formData.name) {
      toast({ title: "Erro", description: "O nome do serviço é obrigatório.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingServiceId) {
        await updateDoc(doc(db, 'services', editingServiceId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast({ title: "Sucesso", description: "Serviço atualizado com sucesso!" });
      } else {
        await addDoc(collection(db, 'services'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast({ title: "Sucesso", description: "Serviço adicionado com sucesso!" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível salvar o serviço.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!db || !confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      await deleteDoc(doc(db, 'services', id));
      toast({ title: "Excluído", description: "Serviço removido do catálogo." });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Não foi possível excluir o serviço.", variant: "destructive" });
    }
  };

  const handleAiDescription = async () => {
    if (!formData.name) {
      toast({ title: "Atenção", description: "Digite o nome do serviço primeiro.", variant: "destructive" });
      return;
    }
    setIsGenerating(formData.name);
    try {
      const result = await generateServiceDescription({
        serviceName: formData.name,
        length: 'medium',
        keywords: ['premium', 'luxury', 'modern']
      });
      setFormData(prev => ({ ...prev, description: result.description }));
      toast({ title: "Descrição Gerada", description: "IA completou a descrição do serviço." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar descrição com IA.", variant: "destructive" });
    } finally {
      setIsGenerating(null);
    }
  };

  const getServiceImage = (imageKey: string) => {
    if (imageKey?.startsWith('data:') || imageKey?.startsWith('http')) return imageKey;
    const found = PlaceHolderImages.find(img => img.id === imageKey);
    return found?.imageUrl || PlaceHolderImages[0].imageUrl;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 md:px-margin max-w-container-max mx-auto space-y-12">
        <header className="flex flex-col items-center text-center gap-6">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Gestão de Serviços</h2>
            <p className="text-muted-foreground text-sm font-medium">Gerencie seu catálogo de serviços premium e preços.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground h-12 px-8 rounded-xl font-black uppercase tracking-widest amber-glow shadow-2xl">
                <Plus size={20} className="mr-2" />
                Adicionar Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 text-foreground rounded-3xl sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-primary uppercase">
                  {editingServiceId ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center gap-2 pb-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-full h-40 rounded-2xl bg-secondary/50 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {formData.image ? (
                      <Image 
                        src={getServiceImage(formData.image)} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <Camera className="text-muted-foreground group-hover:text-primary" size={32} />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles size={24} className="text-white" />
                    </div>
                  </div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Alterar Foto do Serviço</Label>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome do Serviço</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Corte Signature Elite" 
                    className="bg-secondary/50 border-white/5 rounded-xl h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preço (R$)</Label>
                    <Input 
                      type="number"
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="bg-secondary/50 border-white/5 rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duração (min)</Label>
                    <Input 
                      type="number"
                      value={formData.duration} 
                      onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                      className="bg-secondary/50 border-white/5 rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descrição</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
                      onClick={handleAiDescription}
                      disabled={!!isGenerating}
                    >
                      {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                      Gerar com IA
                    </Button>
                  </div>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva os detalhes do serviço..." 
                    className="bg-secondary/50 border-white/5 rounded-xl min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSaveService} 
                  disabled={isSaving}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 rounded-2xl"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : (editingServiceId ? "Atualizar Serviço" : "Criar Serviço")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : services.length > 0 ? (
              services.map((service: any) => (
                <div key={service.id} className="premium-card p-6 rounded-3xl flex flex-col md:flex-row gap-8 items-center group">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/5 relative">
                    <Image src={getServiceImage(service.image)} alt={service.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow text-center md:text-left space-y-3">
                    <h3 className="text-2xl font-black text-primary tracking-tight leading-none">{service.name}</h3>
                    <p className="text-muted-foreground text-xs font-medium leading-relaxed line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                      <span className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        <Clock size={14} className="text-primary" /> {service.duration} min
                      </span>
                      <span className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                        <DollarSign size={14} /> R$ {service.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button 
                      onClick={() => handleOpenEdit(service)}
                      variant="secondary" 
                      size="icon" 
                      className="w-10 h-10 rounded-xl bg-secondary/50 border border-white/5 text-muted-foreground hover:text-primary"
                    >
                      <Edit3 size={18} />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteService(service.id)}
                      variant="secondary" 
                      size="icon" 
                      className="w-10 h-10 rounded-xl bg-secondary/50 border border-white/5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30">
                <p className="font-black uppercase tracking-widest">Nenhum serviço cadastrado</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col justify-between h-72">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Resumo do Catálogo</span>
                <p className="text-3xl font-black text-white leading-tight">{services.length} Serviços<br/>Ativos</p>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Mantenha seu catálogo atualizado para atrair mais clientes.</p>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(services.length * 10, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
