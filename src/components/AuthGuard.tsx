
'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

/**
 * Componente que protege todas as rotas da aplicação.
 * Sincronizado para evitar erro de hidratação.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const logoUrl = "https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isAdminRoute = pathname.startsWith('/admin');
      const isAdminUser = user?.email === 'admin@gmail.com';
      
      const sharedRoutes = ['/profile', '/notifications', '/help', '/profile/meus-dados'];
      const isSharedRoute = sharedRoutes.some(route => pathname === route);
      
      if (!user && !isAuthPage) {
        router.replace('/login');
      } else if (user && isAuthPage) {
        if (isAdminUser) {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      } else if (user && isAdminRoute && !isAdminUser) {
        router.replace('/');
      } else if (user && !isAdminRoute && isAdminUser && !isAuthPage && !isSharedRoute) {
        router.replace('/admin');
      }
    }
  }, [user, loading, pathname, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary amber-glow animate-pulse overflow-hidden p-2">
            <Image 
              src={logoUrl} 
              alt="Logo Torelli" 
              width={80} 
              height={80} 
              className="object-cover rounded-2xl"
              priority
            />
          </div>
          <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-xl animate-pulse"></div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-bounce">
            Torelli Agendamentos
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Validando...</span>
          </div>
        </div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminUser = user?.email === 'admin@gmail.com';
  const sharedRoutes = ['/profile', '/notifications', '/help', '/profile/meus-dados'];
  const isSharedRoute = sharedRoutes.some(route => pathname === route);
  
  if (!user && !isAuthPage) return null;
  if (user && isAuthPage) return null;
  if (user && isAdminRoute && !isAdminUser) return null;
  if (user && !isAdminRoute && isAdminUser && !isAuthPage && !isSharedRoute) return null;

  return <>{children}</>;
}
