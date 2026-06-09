
"use client"

import React from 'react';
import { Home, Calendar, User, LayoutDashboard, Scissors, Users, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // Helper function to handle active state styles
  const getLinkStyles = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-90 touch-none",
      isActive ? "text-primary" : "text-muted-foreground"
    );
  };

  const getIconStyles = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "transition-transform duration-200",
      isActive ? "scale-110 fill-primary/10" : "group-active:scale-95"
    );
  };

  if (isAdmin) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto z-50 flex justify-around items-center px-2 pb-safe h-20 bg-card/95 backdrop-blur-lg border-t border-white/5 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] select-none">
        <Link href="/admin" className={getLinkStyles('/admin')} prefetch={true}>
          <LayoutDashboard size={22} className={getIconStyles('/admin')} />
          <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">Painel</span>
        </Link>
        
        <Link href="/admin/schedule" className={getLinkStyles('/admin/schedule')} prefetch={true}>
          <ClipboardList size={22} className={getIconStyles('/admin/schedule')} />
          <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">Agenda</span>
        </Link>

        <Link href="/admin/barbers" className={getLinkStyles('/admin/barbers')} prefetch={true}>
          <Users size={22} className={getIconStyles('/admin/barbers')} />
          <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">Equipe</span>
        </Link>
        
        <Link href="/admin/services" className={getLinkStyles('/admin/services')} prefetch={true}>
          <Scissors size={22} className={getIconStyles('/admin/services')} />
          <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">Serviços</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto z-50 flex justify-around items-center px-2 pb-safe h-20 bg-card/95 backdrop-blur-lg border-t border-white/5 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] select-none">
      <Link href="/" className={getLinkStyles('/')} prefetch={true}>
        <Home size={22} className={getIconStyles('/')} />
        <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">Início</span>
      </Link>
      
      <Link href="/appointments" className={getLinkStyles('/appointments')} prefetch={true}>
        <Calendar size={22} className={getIconStyles('/appointments')} />
        <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">Agenda</span>
      </Link>
      
      <Link href="/profile" className={getLinkStyles('/profile')} prefetch={true}>
        <User size={22} className={getIconStyles('/profile')} />
        <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">Perfil</span>
      </Link>
    </nav>
  );
};
