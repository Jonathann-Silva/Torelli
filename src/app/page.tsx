"use client"

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Scissors, Zap, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { SERVICES } from '@/lib/mock-data';

export default function HomePage() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-promo');
  const userImg = PlaceHolderImages.find(img => img.id === 'client1');

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-32 px-4 md:px-margin max-w-container-max mx-auto space-y-12">
        {/* Welcome Greeting */}
        <section className="space-y-1">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">Bem-vindo de volta,</p>
          <h2 className="text-4xl font-black text-primary tracking-tighter">Gabriel Martins</h2>
        </section>

        {/* Promotional Banner */}
        <section className="relative overflow-hidden rounded-3xl h-72 md:h-80 flex items-center p-8 group">
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
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          <div className="relative z-10 space-y-6 max-w-md">
            <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black rounded uppercase">Exclusivo</div>
            <h3 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight">Combo Signature: Corte + Barba + Spa Facial</h3>
            <p className="text-muted-foreground text-sm font-medium">Transforme seu visual com nossa experiência completa por um preço especial este mês.</p>
            <Link 
              href="/book"
              className="inline-block bg-primary text-primary-foreground px-8 py-4 text-xs font-black rounded-xl amber-glow hover:brightness-110 transition-all uppercase tracking-widest"
            >
              Aproveitar Agora
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Categorias</h3>
            <span className="text-primary text-xs font-bold uppercase cursor-pointer hover:underline">Ver tudo</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Cabelo', icon: Scissors },
              { label: 'Barba', icon: Zap },
              { label: 'Tratamento', icon: Sparkles }
            ].map((cat, i) => (
              <div key={i} className="premium-card p-6 rounded-2xl flex flex-col items-center gap-3 cursor-pointer group">
                <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-full group-hover:bg-primary/20 transition-colors">
                  <cat.icon size={24} className="text-primary" />
                </div>
                <span className="text-xs font-bold uppercase text-foreground">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Services */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">Serviços Populares</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.slice(0, 2).map((service) => {
              const sImg = PlaceHolderImages.find(img => img.id === service.image);
              return (
                <div key={service.id} className="premium-card rounded-2xl overflow-hidden flex h-40 group cursor-pointer">
                  <div className="w-1/3 relative overflow-hidden">
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
                  <div className="w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-primary truncate leading-none">{service.name}</h4>
                      <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{service.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase">
                        <Clock size={12} />
                        <span>{service.duration} min</span>
                      </div>
                      <span className="text-xl font-black text-foreground">R$ {service.price}</span>
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