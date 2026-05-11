
"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  ShieldCheck, 
  Scissors, 
  Gift, 
  Star, 
  User, 
  UserCog, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export default function ProfilePage() {
  const { user } = useUser();
  const profileImg = PlaceHolderImages.find(img => img.id === 'client1');
  
  // Usamos os dados do usuário logado se disponíveis, caso contrário, o mock solicitado
  const displayName = user?.displayName || "Gabriel Martins";
  const memberSince = "Nov 2023";

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mt-20 px-5 max-w-[480px] mx-auto space-y-8 pb-32">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center pt-4">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-primary p-1 bg-secondary">
              {profileImg && (
                <Image 
                  src={profileImg.imageUrl} 
                  alt={displayName} 
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <div className="absolute -bottom-2 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 shadow-lg amber-glow">
              <ShieldCheck size={12} className="fill-current" />
              ELITE
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{displayName}</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Membro desde {memberSince}</p>
        </section>

        {/* Digital Loyalty Card Section */}
        <section className="bg-secondary/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Cartão Fidelidade</h3>
              <p className="text-muted-foreground text-[10px] font-medium">Complete 10 e ganhe um corte</p>
            </div>
            <span className="text-2xl font-black text-primary">8/10</span>
          </div>
          
          <div className="grid grid-cols-5 gap-3 mb-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/10">
                <Scissors size={16} />
              </div>
            ))}
            <div className="h-10 border border-white/5 bg-secondary/30 rounded-xl"></div>
            <div className="h-10 border border-primary/20 bg-primary/5 rounded-xl flex items-center justify-center text-primary/40">
              <Gift size={16} />
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-xl font-black text-white">12</span>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Visitas</span>
          </div>
          <div className="bg-secondary/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            <Star size={16} className="text-primary mb-1 fill-primary" />
            <span className="text-[8px] font-black text-white uppercase leading-none">Corte Executive</span>
          </div>
          <div className="bg-secondary/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            <User size={16} className="text-primary mb-1" />
            <span className="text-[8px] font-black text-white uppercase leading-none">Ricardo Silva</span>
          </div>
        </section>

        {/* Menu List Section */}
        <section className="space-y-2">
          {[
            { label: 'Meus Dados', icon: UserCog },
            { label: 'Notificações', icon: Bell, badge: true },
            { label: 'Segurança', icon: Shield },
            { label: 'Ajuda', icon: HelpCircle }
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-2xl hover:bg-secondary/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <item.icon size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{item.label}</span>
                  {item.badge && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          ))}
        </section>

        {/* Logout Section */}
        <section className="pt-4">
          <button className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-all font-black text-xs uppercase tracking-widest">
            <LogOut size={18} />
            Sair da Conta
          </button>
          <p className="text-center text-[8px] font-black text-muted-foreground/40 mt-12 uppercase tracking-[0.4em]">Torelli Agendamentos v2.4.0</p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
