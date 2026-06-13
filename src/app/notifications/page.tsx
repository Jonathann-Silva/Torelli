
"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { 
  Bell, 
  CheckCheck, 
  CalendarCheck,
  Info,
  Loader2,
  Share,
  PlusSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, where } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { requestAndSaveNotificationPermission } from '@/lib/pushNotifications';

export default function NotificationsPage() {
  const db = useFirestore();
  const { user } = useUser();

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Verifica se está instalado (Standalone)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isPWA);

    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
    } else {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!db || !user) return;
    
    setIsRegistering(true);
    setErrorMessage(null);
    try {
      await requestAndSaveNotificationPermission(db, user.uid);
      setPermissionStatus(Notification.permission);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Erro ao ativar notificações.');
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
    } finally {
      setIsRegistering(false);
    }
  };

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

  // Renderiza dica para iOS se não estiver em modo standalone
  const renderIosTip = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone) {
      return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <PlusSquare size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Atenção no iPhone</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Para receber notificações push no iOS, você deve primeiro instalar este app:
              </p>
            </div>
          </div>
          <div className="bg-background/40 p-3 rounded-xl flex items-center gap-3 text-[10px] font-bold text-foreground">
            <div className="bg-white/10 p-1.5 rounded-md"><Share size={14} /></div>
            <span>Clique no ícone de compartilhar e depois em <strong>"Adicionar à Tela de Início"</strong>.</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#131313] flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-[480px] mx-auto px-5 pt-24 pb-32 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-primary"></div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Central de Avisos</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Notificações</h2>
          <p className="text-sm font-medium text-muted-foreground">Fique por dentro das atualizações dos seus agendamentos.</p>
        </section>

        {/* Push Notifications Configuration Panel */}
        <section className="space-y-4">
          {renderIosTip()}

          {permissionStatus === 'default' && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden shadow-lg">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/20 flex items-center justify-center text-primary amber-glow">
                  <Bell size={24} className="animate-bounce" />
                </div>
                <div className="space-y-2 flex-grow">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Ativar Notificações Push</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Receba avisos instantâneos de novos agendamentos e atualizações direto no seu celular.
                  </p>
                  {errorMessage && (
                    <p className="text-[10px] font-semibold text-destructive mt-1 bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                      ⚠️ {errorMessage}
                    </p>
                  )}
                  <Button 
                    onClick={handleEnableNotifications}
                    disabled={isRegistering || (!isStandalone && /iPad|iPhone|iPod/.test(navigator.userAgent))}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest mt-2 py-5 rounded-xl transition-all shadow-md shadow-primary/20"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={14} />
                        Configurando...
                      </>
                    ) : 'Ativar Notificações'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {permissionStatus === 'granted' && (
            <div className="bg-secondary/20 border border-white/5 rounded-3xl p-5 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCheck size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Notificações Ativas</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Este dispositivo está configurado e receberá alertas em tempo real.</p>
              </div>
            </div>
          )}

          {permissionStatus === 'denied' && (
            <div className="bg-destructive/5 border border-destructive/10 rounded-3xl p-5 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                <Info size={20} />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Notificações Bloqueadas</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  A permissão foi negada. Para ativá-las, limpe as configurações do site no seu navegador ou acesse: Ajustes {' > '} Safari {' > '} Notificações (se instalado).
                </p>
              </div>
            </div>
          )}

          {permissionStatus === 'unsupported' && (
            <div className="bg-secondary/20 border border-white/5 rounded-3xl p-5 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-muted/10 border border-white/5 flex items-center justify-center text-muted-foreground">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Não suportado</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Seu navegador não suporta a Push API nativa.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Notifications List */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Mensagens Recebidas</h3>
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
