"use client"

import React from 'react';
import { Menu, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const Header = () => {
  const managerImg = PlaceHolderImages.find(img => img.id === 'manager');

  return (
    <header className="flex justify-between items-center px-4 md:px-margin h-16 w-full z-50 fixed top-0 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4">
        <button className="p-2 text-primary hover:bg-white/5 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
        <Link href="/">
          <h1 className="font-headline text-2xl font-extrabold tracking-tighter text-primary">ELITE BLADE</h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-6 mr-6">
          <Link href="/admin" className="text-sm font-semibold text-primary hover:brightness-110">Dashboard</Link>
          <Link href="/admin/schedule" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Agenda</Link>
          <Link href="/admin/services" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Serviços</Link>
        </div>
        
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="w-8 h-8 rounded-full bg-secondary border border-white/10 overflow-hidden relative">
          {managerImg && (
            <Image 
              src={managerImg.imageUrl} 
              alt="Profile" 
              fill
              className="object-cover"
              data-ai-hint={managerImg.imageHint}
            />
          )}
        </div>
      </div>
    </header>
  );
};