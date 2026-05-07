
"use client"

import React, { useMemo } from 'react';
import { Menu, Bell, CheckCheck, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Header = () => {
  const db = useFirestore();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const managerImg = PlaceHolderImages.find(img => img.id === 'manager');

  const notificationsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db]);

  const { data: notifications = [] } = useCollection(notificationsQuery);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    if (!db) return;
    const notificationRef = doc(db, 'notifications', id);
    updateDoc(notificationRef, { read: true });
  };

  return (
    <header className="flex justify-between items-center px-4 h-16 w-full z-50 fixed top-0 left-0 right-0 max-w-[480px] mx-auto bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <ShieldCheck size={18} />
            </div>
            <Link href="/admin">
              <h1 className="font-headline text-lg font-black tracking-tighter text-white leading-none">ADMIN <span className="text-primary">TA</span></h1>
            </Link>
          </div>
        ) : (
          <Link href="/">
            <h1 className="font-headline text-xl font-extrabold tracking-tighter text-primary leading-none">Torelli Agendamentos</h1>
          </Link>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse border border-background shadow-lg shadow-primary/20"></span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-card border-white/5 p-0">
            <SheetHeader className="p-6 border-b border-white/5">
              <SheetTitle className="text-xl font-black text-white tracking-tight flex items-center justify-between">
                Notificações
                {unreadCount > 0 && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4 space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        n.read ? 'bg-secondary/10 border-white/5 opacity-60' : 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5'
                      }`}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1.5 rounded-lg ${n.read ? 'bg-white/5 text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                          {n.type === 'alert' ? <Info size={14} /> : <CheckCheck size={14} />}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-xs font-black text-foreground uppercase tracking-widest truncate">{n.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                          <p className="text-[8px] font-bold text-primary/60 uppercase tracking-tighter pt-1">
                            {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR }) : 'Agora'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                    <Bell size={48} className="text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nenhuma notificação</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
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
