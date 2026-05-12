
"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Scissors, Zap, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { SERVICES } from '@/lib/mock-data';
import { useUser } from '@/firebase';

export default function HomePage() {
  const { user } = useUser();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-promo');

  return (
    <div className="min-h-screen pb-32">
      <Header />
      
      <main className="pt-20 px-5 space-y-10">
        {/* Welcome Greeting */}
        <section className="space-y-1">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">Bem-vindo de volta,</p>
          <h2 className="text-3xl font-black text-primary tracking-tighter">{user?.displayName || 'Cliente'}</h2>
        </section>

        {/* Promotional Banner */}
        <section className="relative overflow-hidden rounded-3xl h-64 flex items-center p-6 group">
          <div className="absolute inset-0 z-0">
            {heroImg && (
              <Image 
                src={heroImg.imageUrl} 
                alt="Promo" 
                fill 
                className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
                data-ai-hint={heroImg.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent"></div>
          </div>
          <div className="relative z-10 space-y-4 max-w-[200px]">
            <div className="inline-block px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-black rounded uppercase tracking-widest">Exclusivo</div>
            <h3 className="text-2xl font-black text-white leading-tight tracking-tight">Combo Signature: Corte + Barba</h3>
            <p className="text-muted-foreground text-[11px] font-medium leading-snug">Experiência completa com preço especial.</p>
            <Link 
              href="/book"
              className="inline-block bg-primary text-primary-foreground px-5 py-3 text-[10px] font-black rounded-xl amber-glow hover:brightness-110 transition-all uppercase tracking-widest"
            >
              Agendar
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Categorias</h3>
            <span className="text-primary text-[10px] font-bold uppercase tracking widest cursor-pointer hover:underline">Ver tudo</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Cabelo', icon: Scissors },
              { label: 'Barba', icon: Zap },
              { label: 'Combo', icon: Sparkles }
            ].map((cat, i) => (
              <div key={i} className="premium-card p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                  <cat.icon size={20} className="text-primary" />
                </div>
                <span className="text-[9px] font-black uppercase text-foreground tracking-tighter">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Services */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white">Mais Pedidos</h3>
          </div>
          <div className="space-y-4">
            {SERVICES.slice(0, 3).map((service) => {
              const sImg = PlaceHolderImages.find(img => img.id === service.image);
              return (
                <div key={service.id} className="premium-card rounded-2xl overflow-hidden flex h-32 group cursor-pointer">
                  <div className="w-28 relative overflow-hidden shrink-0">
                    {sImg && (
                      <Image 
                        src={sImg.imageUrl} 
                        alt={service.name} 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        data-ai-hint={sImg.imageHint}
                      />
                    )}
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-primary truncate leading-none">{service.name}</h4>
                      <p className="text-muted-foreground text-[10px] mt-1.5 line-clamp-2 leading-relaxed">{service.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-muted-foreground text-[9px] font-bold uppercase">
                        <Clock size={10} />
                        <span>{service.duration} min</span>
                      </div>
                      <span className="text-base font-black text-foreground tracking-tighter">R$ {service.price}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
}
