
"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Link direto para o logotipo (raw=1 garante que o Next.js consiga baixar a imagem)
  const logoUrl = "https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1";

  useEffect(() => {
    if (!userLoading && user) {
      if (user.email === 'admin@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;
      
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });

      if (loggedUser.email === 'admin@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      let message = "E-mail ou senha incorretos.";
      
      if (error.code === 'auth/invalid-credential') {
        message = "Credenciais inválidas. Verifique se o e-mail e a senha estão corretos.";
      } else if (error.code === 'auth/user-not-found') {
        message = "Usuário não encontrado. Verifique o e-mail digitado.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Senha incorreta. Tente novamente.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Muitas tentativas malsucedidas. Tente novamente mais tarde.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao acessar",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-[480px] mx-auto px-6 pt-24 space-y-12">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto mb-6 amber-glow rounded-3xl overflow-hidden bg-primary/5 p-2">
            <Image 
              src={logoUrl} 
              alt="Logo Torelli" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Barbearia Torelli</h2>
          <p className="text-muted-foreground text-sm">Acesse sua conta para gerenciar seus agendamentos premium.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">E-mail</Label>
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#1A1A1A] border-white/5 h-14 rounded-xl focus:ring-primary text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Senha</Label>
              <Input 
                type="password" 
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1A1A1A] border-white/5 h-14 rounded-xl focus:ring-primary text-white"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest amber-glow hover:brightness-110 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <div className="text-center space-y-6">
          <p className="text-xs text-muted-foreground">Não tem uma conta?</p>
          <Link href="/register" className="text-primary font-black uppercase text-[10px] tracking-[0.2em] hover:underline">
            Criar conta agora
          </Link>
        </div>
      </main>
    </div>
  );
}
