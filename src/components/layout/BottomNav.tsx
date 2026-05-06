"use client"

import React from 'react';
import { Home, Calendar, User, Plus, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Floating Action Button for Home only */}
      {pathname === '/' && (
        <Link 
          href="/book" 
          className="fixed bottom-24 right-[calc(50%-210px)] z-50 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center amber-glow hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={28} />
        </Link>
      )}

      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto z-50 flex justify-around items-center px-2 pb-safe h-20 bg-card/95 backdrop-blur-md border-t border-white/5 rounded-t-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <Link 
          href="/" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname === '/' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Home size={22} className={pathname === '/' ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Início</span>
        </Link>
        
        <Link 
          href="/appointments" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname === '/appointments' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Calendar size={22} className={pathname === '/appointments' ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Agenda</span>
        </Link>

        <Link 
          href="/admin" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname.startsWith('/admin') ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <LayoutDashboard size={22} className={pathname.startsWith('/admin') ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Gestão</span>
        </Link>
        
        <Link 
          href="/login" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname === '/login' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <User size={22} className={pathname === '/login' ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Perfil</span>
        </Link>
      </nav>
    </>
  );
};
