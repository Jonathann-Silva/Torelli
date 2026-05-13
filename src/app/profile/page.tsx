"use client"

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  Scissors, 
  Gift, 
  Star, 
  User, 
  UserCog, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useUser, useDoc, useFirestore, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: userData } = useDoc(userDocRef);
  
  const profileImg = user?.photoURL || PlaceHolderImages.find(img => img.id === 'client1')?.imageUrl;
  const displayName = user?.displayName || "Cliente";
  const memberSince = userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : "---";
  
  const loyaltyPoints = userData?.loyaltyPoints || 0;
  const maxPoints = 10;
  const hasReward = loyaltyPoints >= maxPoints;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const isAdmin = user?.email === 'admin@gmail.com';

  const menuItems = [
    { label: 'Meus Dados', icon: UserCog, href: '/profile/meus-dados' },
    { label: 'Notificações', icon: Bell, badge: true, href: '/notifications' },
    { label: 'Segurança', icon: Shield, href: '#' },
    { label: 'Ajuda', icon: HelpCircle, href: '/help' }
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mt-20 px-5 max-w-[480px] mx-auto space-y-8 pb-32">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center pt-4">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-primary p-1 bg-secondary transition-all">
              {profileImg && (
                <Image 
                  src={profileImg} 
                  alt={displayName} 
                  width={96}
                  height={96}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-lg shadow-lg">
                <ShieldCheck size={16} />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{displayName}</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Membro desde {memberSince}</p>
        </section>

        {/* Admin Access Quick Link */}
        {isAdmin && (
          <Link href="/admin">
            <button className="w-full bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between group hover:bg-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-white uppercase tracking-tighter">Painel Administrativo</span>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Acesso Restrito</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-primary" />
            </button>
          </Link>
        )}

        {/* Digital Loyalty Card Section */}
        <section className="bg-secondary/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Cartão Fidelidade</h3>
              <p className="text-muted-foreground text-[10px] font-medium">
                {hasReward ? "Parabéns! Você tem um corte grátis!" : "Complete 10 e ganhe um corte"}
              </p>
            </div>
            <span className="text-2xl font-black text-primary">{Math.min(loyaltyPoints, maxPoints)}/{maxPoints}</span>
          </div>
          
          <div className="grid grid-cols-5 gap-3 mb-2">
            {[...Array(maxPoints)].map((_, i) => {
              const isFilled = i < loyaltyPoints;
              const isLast = i === maxPoints - 1;
              
              if (isLast && hasReward) {
                return (
                  <div key={i} className="h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 animate-bounce">
                    <Gift size={16} />
                  </div>
                );
              }

              return (
                <div 
                  key={i} 
                  className={`h-10 rounded-xl flex items-center justify-center transition-all ${
                    isFilled 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' 
                    : 'border border-white/5 bg-secondary/30 text-muted-foreground/20'
                  }`}
                >
                  <Scissors size={16} className={isFilled ? "opacity-100" : "opacity-20"} />
                </div>
              );
            })}
          </div>

          {hasReward && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2 justify-center">
              <CheckCircle2 size={14} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Aproveite seu desconto no próximo corte!</span>
            </div>
          )}
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
            <span className="text-xl font-black text-white">{userData?.loyaltyPoints || 0}</span>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Pontos</span>
          </div>
          <div className="bg-secondary/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            <Star size={16} className="text-primary mb-1 fill-primary" />
            <span className="text-[8px] font-black text-white uppercase leading-none">VIP Status</span>
          </div>
          <div className="bg-secondary/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center text-center">
            <User size={16} className="text-primary mb-1" />
            <span className="text-[8px] font-black text-white uppercase leading-none text-xs truncate max-w-full">{userData?.phone || 'Sem Telefone'}</span>
          </div>
        </section>

        {/* Menu List Section */}
        <section className="space-y-2">
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href}>
              <button className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-2xl hover:bg-secondary/40 transition-all group mb-2">
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
            </Link>
          ))}
        </section>

        {/* Logout Section */}
        <section className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
          <p className="text-center text-[8px] font-black text-muted-foreground/40 mt-12 uppercase tracking-[0.4em]">Torelli Agendamentos V0.0.9</p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
