
"use client"

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, Scissors } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>

      <main className="relative z-10 w-full max-w-md space-y-12">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 amber-glow">
              <Scissors size={32} className="text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-primary">Torelli Agendamentos</h1>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted-foreground">Premium Grooming Experience</p>
          </div>
        </header>

        <div className="bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 space-y-8">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Senha</label>
                <Link href="#" className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors">Esqueci minha senha</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-secondary/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-primary/50 transition-all text-sm"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest amber-glow hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Entrar
            </button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="mx-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Ou acesse com</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-secondary/30 border border-white/5 py-4 rounded-2xl font-bold text-sm hover:bg-secondary/50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
            </svg>
            Google
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Não tem uma conta? 
            <Link href="#" className="text-primary font-bold ml-1 hover:underline">Criar conta</Link>
          </p>
        </div>
      </main>

      {/* Decorative Accents */}
      <div className="fixed top-12 left-12 w-24 h-24 border-t border-l border-primary/20 pointer-events-none hidden lg:block"></div>
      <div className="fixed bottom-12 right-12 w-24 h-24 border-b border-r border-primary/20 pointer-events-none hidden lg:block"></div>
    </div>
  );
}
