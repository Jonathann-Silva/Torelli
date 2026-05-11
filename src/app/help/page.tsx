
"use client"

import React from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Scissors, 
  Gift, 
  MessageSquare, 
  LifeBuoy
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const faqs = [
    {
      question: "Como posso cancelar ou reagendar meu horário?",
      answer: "Você pode gerenciar todos os seus agendamentos diretamente na aba 'Agenda' do aplicativo. Cancelamentos realizados com até 2 horas de antecedência não geram cobranças adicionais."
    },
    {
      question: "Quais são as formas de pagamento aceitas?",
      answer: "Aceitamos todos os principais cartões de crédito e débito, pagamentos via Pix diretamente no checkout do app, e pagamento em espécie na unidade física."
    },
    {
      question: "Como funciona o programa de fidelidade Torelli?",
      answer: "Cada serviço realizado acumula 1 ponto. Ao atingir 10 pontos, você ganha um serviço de barba ou corte de cabelo clássico totalmente cortesia."
    },
    {
      question: "Posso escolher um barbeiro específico?",
      answer: "Sim! No momento da reserva, você terá a opção de selecionar o profissional de sua preferência."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-[480px] mx-auto px-5 pt-24 pb-32 space-y-10">
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-[1px] w-8 bg-primary"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Suporte ao Cliente</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Como podemos ajudar?</h2>
          <p className="text-sm font-medium text-muted-foreground">Encontre respostas rápidas para as dúvidas mais frequentes ou entre em contato direto.</p>
        </section>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
          <Input 
            className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 pl-12 pr-4 focus:ring-primary text-white"
            placeholder="Pesquisar por assunto..."
          />
        </div>

        {/* Categories Grid */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: 'Agendamentos', icon: Calendar },
            { label: 'Pagamentos', icon: CreditCard },
            { label: 'Serviços', icon: Scissors },
            { label: 'Fidelidade', icon: Gift }
          ].map((cat, i) => (
            <div key={i} className="bg-secondary/20 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:bg-secondary/40 transition-all border-b-2 hover:border-b-primary">
              <cat.icon size={20} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{cat.label}</span>
            </div>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Dúvidas Frequentes</h3>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-white/5 bg-secondary/10 rounded-2xl px-4 overflow-hidden">
                <AccordionTrigger className="text-sm font-bold text-left hover:no-underline hover:text-primary py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Contact Card */}
        <section className="bg-primary/5 border border-primary/20 p-8 rounded-3xl relative overflow-hidden amber-glow">
          <div className="relative z-10 space-y-6">
            <h4 className="text-2xl font-black text-white tracking-tight leading-tight">Ainda com dúvidas?</h4>
            <p className="text-sm font-medium text-muted-foreground">Nosso suporte está disponível via WhatsApp de Seg-Sáb, 08h às 20h.</p>
            <Button className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
              <MessageSquare size={20} />
              Falar no WhatsApp
            </Button>
          </div>
          <LifeBuoy size={120} className="absolute -right-8 -bottom-8 text-primary/5 rotate-12 pointer-events-none" />
        </section>

        <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-6 opacity-30">
          <div className="flex gap-6">
            <button className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Termos de Uso</button>
            <button className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacidade</button>
          </div>
          <p className="text-[8px] font-black uppercase tracking-[0.3em]">Versão 0.0.9 (Build 108)</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
