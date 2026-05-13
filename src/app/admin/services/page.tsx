
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Plus, Edit3, Trash2, Clock, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { SERVICES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { generateServiceDescription } from '@/ai/flows/generate-service-description';
import { toast } from '@/hooks/use-toast';

export default function ServicesAdminPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleAiDescription = async (serviceName: string) => {
    setIsGenerating(serviceName);
    try {
      const result = await generateServiceDescription({
        serviceName,
        length: 'medium',
        keywords: ['premium', 'luxury', 'modern']
      });
      toast({
        title: "Descrição Gerada",
        description: "A IA criou uma nova descrição para seu serviço.",
      });
      // In a real app, we would update state here
      console.log('AI Description:', result.description);
    } catch (error) {
      toast({
        title: "Erro ao gerar",
        description: "Não foi possível usar a IA no momento.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
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
          <Button className="bg-primary text-primary-foreground h-12 px-8 rounded-xl font-black uppercase tracking-widest amber-glow shadow-2xl">
            <Plus size={20} className="mr-2" />
            Adicionar Novo Serviço
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Service List */}
          <div className="md:col-span-8 space-y-6">
            {SERVICES.map((service) => {
              const sImg = PlaceHolderImages.find(img => img.id === service.image);
              return (
                <div key={service.id} className="premium-card p-6 rounded-3xl flex flex-col md:flex-row gap-8 items-center group">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/5 relative">
                    {sImg && <Image src={sImg.imageUrl} alt={service.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-grow text-center md:text-left space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="text-2xl font-black text-primary tracking-tight leading-none">{service.name}</h3>
                      <div className="flex items-center justify-center gap-3">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-9 px-3 rounded-lg text-primary hover:bg-primary/20"
                          onClick={() => handleAiDescription(service.name)}
                          disabled={!!isGenerating}
                        >
                          {isGenerating === service.name ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="mr-1" />}
                          AI Describe
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium leading-relaxed">{service.description}</p>
                    <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                      <span className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        <Clock size={14} className="text-primary" /> {service.duration} min
                      </span>
                      <span className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                        <DollarSign size={14} /> R$ {service.price},00
                      </span>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button variant="secondary" size="icon" className="w-10 h-10 rounded-xl bg-secondary/50 border border-white/5 text-muted-foreground hover:text-primary">
                      <Edit3 size={18} />
                    </Button>
                    <Button variant="secondary" size="icon" className="w-10 h-10 rounded-xl bg-secondary/50 border border-white/5 text-muted-foreground hover:text-destructive">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col justify-between h-72">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Resumo do Catálogo</span>
                <p className="text-3xl font-black text-white leading-tight">12 Serviços<br/>Ativos</p>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Seu ticket médio atual é de <span className="text-primary font-black">R$ 62,50</span> por agendamento.</p>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '66%' }}></div>
                </div>
              </div>
            </div>

            {/* Minor Services List */}
            <div className="space-y-3">
              {[
                { name: 'Sobrancelha', price: 25, duration: 15 },
                { name: 'Pigmentação', price: 40, duration: 20 },
                { name: 'Platinado Lux', price: 150, duration: 120 }
              ].map((s, i) => (
                <div key={i} className="bg-card/40 border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:bg-card transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">R$ {s.price},00 • {s.duration} min</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-muted-foreground hover:text-primary"><Edit3 size={16} /></button>
                    <button className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
