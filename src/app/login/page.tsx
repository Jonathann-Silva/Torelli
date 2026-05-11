
"use client"

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-[480px] mx-auto px-6 pt-32 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 amber-glow">
            <Scissors size={40} />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Bem-vindo</h2>
          <p className="text-muted-foreground text-sm">Acesse sua conta para gerenciar seus agendamentos premium.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">E-mail</Label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                className="bg-[#1A1A1A] border-white/5 h-14 rounded-xl focus:ring-primary text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Senha</Label>
              <Input 
                type="password" 
                placeholder="********" 
                className="bg-[#1A1A1A] border-white/5 h-14 rounded-xl focus:ring-primary text-white"
              />
            </div>
          </div>

          <Button className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest amber-glow hover:brightness-110 active:scale-95 transition-all">
            Entrar
          </Button>
        </form>

        <div className="text-center space-y-6">
          <p className="text-xs text-muted-foreground">Não tem uma conta?</p>
          <Link href="/register" className="text-primary font-black uppercase text-[10px] tracking-[0.2em] hover:underline">
            Criar conta agora
          </Link>
        </div>
      </main>
    </div>
  );
}
