
"use client"

import React from 'react';
import { Home, Calendar, User, LayoutDashboard, Scissors, Users, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto z-50 flex justify-around items-center px-2 pb-safe h-20 bg-card/95 backdrop-blur-md border-t border-white/5 rounded-t-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <Link 
          href="/admin" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname === '/admin' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <LayoutDashboard size={22} className={pathname === '/admin' ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Painel</span>
        </Link>
        
        <Link 
          href="/admin/schedule" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname === '/admin/schedule' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <ClipboardList size={22} className={pathname === '/admin/schedule' ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Agenda</span>
        </Link>

        <Link 
          href="/admin/barbers" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname === '/admin/barbers' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Users size={22} className={pathname === '/admin/barbers' ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Equipe</span>
        </Link>
        
        <Link 
          href="/admin/services" 
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 transition-all",
            pathname === '/admin/services' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Scissors size={22} className={pathname === '/admin/services' ? "fill-primary/20" : ""} />
          <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Serviços</span>
        </Link>
      </nav>
    );
  }

  return (
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
        href="/profile" 
        className={cn(
          "flex flex-col items-center justify-center w-16 h-16 transition-all",
          pathname === '/profile' ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
        )}
      >
        <User size={22} className={pathname === '/profile' ? "fill-primary/20" : ""} />
        <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">Perfil</span>
      </Link>
    </nav>
  );
};
