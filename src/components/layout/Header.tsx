
"use client"

import React, { useMemo } from 'react';
import { Bell, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, where } from 'firebase/firestore';
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
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith('/admin');

  const notificationsQuery = useMemo(() => {
    if (!db) return null;
    
    if (isAdmin) {
      return query(
        collection(db, 'notifications'),
        where('recipientRole', '==', 'admin'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
    } else if (user) {
      return query(
        collection(db, 'notifications'),
        where('recipientId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
    }
    return null;
  }, [db, isAdmin, user]);

  const { data: notifications = [] } = useCollection(notificationsQuery);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    if (!db) return;
    const notificationRef = doc(db, 'notifications', id);
    updateDoc(notificationRef, { read: true });
  };

  const showBackButton = pathname !== '/' && pathname !== '/admin';

  return (
    <header className="flex justify-between items-center px-4 h-16 w-full z-40 fixed top-0 left-0 right-0 max-w-[480px] mx-auto bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button 
            onClick={() => router.back()}
            className="p-1 -ml-1 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <h1 className="font-headline text-lg font-black tracking-tighter text-white leading-none uppercase">ADMIN <span className="text-primary">Torelli</span></h1>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/">
              <h1 className="font-headline text-xl font-extrabold tracking-tighter text-primary leading-none">Torelli</h1>
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors relative outline-none">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse border border-background"></span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            className="w-[320px] p-0 bg-card border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Avisos</h3>
              {unreadCount > 0 && <span className="text-[8px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase">{unreadCount} novos</span>}
            </div>
            
            <ScrollArea className="max-h-[350px]">
              <div className="p-2 space-y-1">
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div 
                      key={n.id} 
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-secondary/10 border-white/5 opacity-50' : 'bg-primary/5 border-primary/20'}`}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <h4 className="text-[10px] font-black text-foreground uppercase truncate">{n.title}</h4>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-1">{n.message}</p>
                      <p className="text-[8px] font-bold text-primary/60 uppercase mt-2">
                        {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR }) : 'Agora'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Nenhum aviso</div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
