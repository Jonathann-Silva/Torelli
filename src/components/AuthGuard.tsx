'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Scissors } from 'lucide-react';

/**
 * Componente que protege todas as rotas da aplicação.
 * Se o usuário não estiver autenticado e tentar acessar uma página protegida,
 * ele será redirecionado para o login.
 * Adicionalmente, restringe rotas /admin apenas para admin@gmail.com.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isAdminRoute = pathname.startsWith('/admin');
      const isAdminUser = user?.email === 'admin@gmail.com';
      
      if (!user && !isAuthPage) {
        // Se não logado e não está em login/register, vai para login
        router.replace('/login');
      } else if (user && isAuthPage) {
        // Se logado e está em login/register, vai para o início
        router.replace('/');
      } else if (user && isAdminRoute && !isAdminUser) {
        // RESTRIÇÃO: Se logado, em rota admin, mas não é o e-mail autorizado, volta para o início
        router.replace('/');
      }
    }
  }, [user, loading, pathname, router, mounted]);

  // Evita Hydration Mismatch e mostra loader durante a verificação do Firebase
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary amber-glow animate-pulse">
            <Scissors size={40} />
          </div>
          <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-xl animate-pulse"></div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-bounce">
            Torelli Agendamentos
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={14} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Verificando Acesso...</span>
          </div>
        </div>
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminUser = user?.email === 'admin@gmail.com';
  
  // Se não estiver logado e a página for protegida, não renderiza nada enquanto redireciona
  if (!user && !isAuthPage) {
    return null;
  }

  // Se estiver logado e tentar acessar login/register, não renderiza nada enquanto redireciona
  if (user && isAuthPage) {
    return null;
  }

  // Se tentar acessar admin sem ser o admin@gmail.com, não renderiza nada enquanto redireciona
  if (user && isAdminRoute && !isAdminUser) {
    return null;
  }

  return <>{children}</>;
}
