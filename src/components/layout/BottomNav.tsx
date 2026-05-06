"use client"

import React from 'react';
import { Home, Calendar, User, Plus } from 'lucide-react';
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
          className="fixed bottom-24 right-6 z-50 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center amber-glow hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={28} />
        </Link>
      )}

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-20 bg-card/90 backdrop-blur-md border-t border-white/5 rounded-t-2xl md:hidden">
        <Link 
          href="/" 
          className={cn(
            "flex flex-col items-center justify-center transition-all",
            pathname === '/' ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Home size={22} className={pathname === '/' ? "fill-primary/20" : ""} />
          <span className="text-[10px] font-bold uppercase mt-1">Home</span>
        </Link>
        
        <Link 
          href="/appointments" 
          className={cn(
            "flex flex-col items-center justify-center transition-all",
            pathname === '/appointments' ? "text-primary bg-primary/10 rounded-xl px-4 py-1" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Calendar size={22} className={pathname === '/appointments' ? "fill-primary/20" : ""} />
          <span className="text-[10px] font-bold uppercase mt-1">Agenda</span>
        </Link>
        
        <Link 
          href="/login" 
          className={cn(
            "flex flex-col items-center justify-center transition-all",
            pathname === '/login' ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <User size={22} className={pathname === '/login' ? "fill-primary/20" : ""} />
          <span className="text-[10px] font-bold uppercase mt-1">Perfil</span>
        </Link>
      </nav>
    </>
  );
};