
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { User, Mail, Phone, Lock, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function MeusDadosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const profileImg = PlaceHolderImages.find(img => img.id === 'client1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de salvamento
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Dados atualizados!",
        description: "Suas informações foram salvas com sucesso.",
      });
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header />
      
      <main className="max-w-[480px] mx-auto px-5 pt-24 pb-32 space-y-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary p-1 bg-secondary/30">
              <Image 
                src={profileImg?.imageUrl || ''} 
                alt="Profile" 
                width={128} 
                height={128} 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg transition-transform active:scale-95 amber-glow">
              <Camera size={20} />
            </button>
          </div>
          <h2 className="text-2xl font-black text-white mt-6 tracking-tight">Meus Dados</h2>
          <p className="text-xs font-medium text-muted-foreground opacity-70 uppercase tracking-widest mt-1">Gerencie suas informações pessoais</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Nome Completo</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  placeholder="Seu nome"
                  defaultValue="Ricardo Oliveira de Souza"
                />
                <User className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">E-mail</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  type="email"
                  placeholder="seu@email.com"
                  defaultValue="ricardo.souza@email.com"
                />
                <Mail className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Telefone</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  placeholder="(00) 00000-0000"
                  defaultValue="(11) 98765-4321"
                />
                <Phone className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Senha</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  type="password"
                  defaultValue="********"
                />
                <Lock className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest amber-glow hover:brightness-110 active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-14 rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest hover:bg-primary/5"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>

        <div className="flex justify-center opacity-5 select-none pt-10">
          <span className="text-8xl font-black text-white">TA</span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
