
"use client"

import React, { useMemo } from 'react';
import { Bell, CheckCheck, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors relative outline-none">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse border border-background shadow-lg shadow-primary/20"></span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            sideOffset={8}
            className="w-[calc(100vw-32px)] max-w-[360px] p-0 bg-card/95 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Notificações</h3>
              {unreadCount > 0 && (
                <span className="text-[9px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {unreadCount} novas
                </span>
              )}
            </div>
            
            <ScrollArea className="max-h-[400px]">
              <div className="p-3 space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        n.read ? 'bg-secondary/20 border-white/5 opacity-50' : 'bg-primary/5 border-primary/20'
                      }`}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-xl shrink-0 ${n.read ? 'bg-white/5 text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                          {n.type === 'alert' ? <Info size={14} /> : <CheckCheck size={14} />}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest truncate">{n.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                          <p className="text-[8px] font-bold text-primary/60 uppercase tracking-tighter pt-1">
                            {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR }) : 'Agora'}
                          </p>
                        </div>
                      </div>
                      {!n.read && (
                        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-30">
                    <Bell size={32} className="text-muted-foreground" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tudo limpo por aqui</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-3 bg-white/5 border-t border-white/5">
              <button className="w-full py-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/5 rounded-xl transition-colors">
                Marcar todas como lidas
              </button>
            </div>
          </PopoverContent>
        </Popover>
        
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
