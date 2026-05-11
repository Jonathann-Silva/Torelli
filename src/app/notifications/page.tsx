
"use client"

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  Bell, 
  Mail, 
  CheckCheck, 
  CalendarCheck,
  Info,
  Loader2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, where } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationsPage() {
  const db = useFirestore();
  const { user } = useUser();

  const notificationsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, user]);

  const { data: notifications = [], loading } = useCollection(notificationsQuery);

  const handleMarkAsRead = (id: string) => {
    if (!db) return;
    const notificationRef = doc(db, 'notifications', id);
    updateDoc(notificationRef, { read: true });
  };

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-[480px] mx-auto px-5 pt-24 pb-32 space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-primary"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Central de Avisos</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Notificações</h2>
          <p className="text-sm font-medium text-muted-foreground">Fique por dentro das atualizações dos seus agendamentos.</p>
        </section>

        <section className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : notifications.length > 0 ? (
            notifications.map((n: any) => (
              <div 
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                className={`group bg-[#1C1B1B] border border-white/5 p-5 rounded-2xl flex gap-4 items-start transition-all hover:bg-[#201F1F] relative cursor-pointer ${n.read ? 'opacity-50' : ''}`}
              >
                {!n.read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10 bg-primary rounded-r-full"></div>}
                
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border border-white/5 ${
                  n.type === 'alert' ? 'bg-destructive/10 text-destructive' : 
                  n.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                }`}>
                  {n.type === 'alert' ? <Info size={20} /> : <CalendarCheck size={20} />}
                </div>

                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-white leading-none">{n.title}</h4>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR }) : 'Agora'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 gap-4">
              <Bell size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest">Sem novas notificações</p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
