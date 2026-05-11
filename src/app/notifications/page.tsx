
"use client"

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  Bell, 
  Mail, 
  ChevronRight, 
  CheckCheck, 
  Clock, 
  Star, 
  CalendarCheck,
  Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationsPage() {
  const db = useFirestore();

  const notificationsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db]);

  const { data: notifications = [], loading } = useCollection(notificationsQuery);

  const handleMarkAsRead = (id: string) => {
    if (!db) return;
    const notificationRef = doc(db, 'notifications', id);
    updateDoc(notificationRef, { read: true });
  };

  const handleMarkAllAsRead = async () => {
    if (!db) return;
    const unread = notifications.filter((n: any) => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-[480px] mx-auto px-5 pt-24 pb-32 space-y-10">
        {/* Page Title & Header */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-primary"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Central de Avisos</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Notificações</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            Mantenha-se atualizado sobre seus agendamentos e receba ofertas exclusivas de nossa curadoria.
          </p>
        </section>

        {/* Settings Section */}
        <section className="grid grid-cols-1 gap-3">
          <div className="bg-[#1C1B1B] border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-[#201F1F] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Push Notifications</h4>
                <p className="text-[10px] font-medium text-muted-foreground">Alertas no dispositivo</p>
              </div>
            </div>
            <Switch checked className="data-[state=checked]:bg-primary" />
          </div>

          <div className="bg-[#1C1B1B] border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:bg-[#201F1F] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">E-mail Marketing</h4>
                <p className="text-[10px] font-medium text-muted-foreground">Newsletter e promos</p>
              </div>
            </div>
            <Switch className="data-[state=checked]:bg-primary" />
          </div>
        </section>

        {/* Notification List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Recentes</h3>
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              Marcar todas como lidas
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl"></div>
              ))
            ) : notifications.length > 0 ? (
              notifications.map((n: any) => (
                <div 
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`group bg-[#1C1B1B] border border-white/5 p-5 rounded-2xl flex gap-4 items-start transition-all hover:bg-[#201F1F] relative cursor-pointer ${n.read ? 'opacity-50' : ''}`}
                >
                  {!n.read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 bg-primary rounded-r-full group-hover:h-14 transition-all"></div>
                  )}
                  
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border border-white/5 ${
                    n.type === 'alert' ? 'bg-destructive/10 text-destructive' : 
                    n.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {n.type === 'alert' ? <Info size={20} /> : 
                     n.type === 'success' ? <CalendarCheck size={20} /> : <CheckCheck size={20} />}
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-white leading-none">{n.title}</h4>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">
                        {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR }) : 'Agora'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 gap-4">
                <Bell size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest">Tudo limpo por aqui</p>
              </div>
            )}
          </div>
        </section>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="h-12 px-8 rounded-xl border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5">
            Ver Histórico Completo
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
