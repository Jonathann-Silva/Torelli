
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Atualizar o nome do perfil no Auth
      await updateProfile(user, {
        displayName: name
      });

      // 3. Criar o documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        email: email,
        loyaltyPoints: 0,
        updatedAt: new Date().toISOString(),
        phone: ""
      });

      toast({
        title: "Conta criada!",
        description: `Bem-vindo à Torelli Agendamentos, ${name}!`,
      });

      router.push('/');
    } catch (error: any) {
      console.error(error);
      let message = "Não foi possível criar sua conta.";
      if (error.code === 'auth/email-already-in-use') message = "Este e-mail já está em uso.";
      if (error.code === 'auth/weak-password') message = "A senha deve ter pelo menos 6 caracteres.";
      
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-[480px] mx-auto px-6 pt-12 space-y-12">
        <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Voltar para Login</span>
        </Link>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 amber-glow">
            <Scissors size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Criar Conta</h2>
          <p className="text-muted-foreground text-sm">Junte-se ao clube e comece a pontuar agora mesmo.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Nome Completo</Label>
              <Input 
                type="text" 
                placeholder="Como quer ser chamado?" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#1A1A1A] border-white/5 h-14 rounded-xl focus:ring-primary text-white"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[#1A1A1A] border-white/5 h-14 rounded-xl focus:ring-primary text-white"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest amber-glow hover:brightness-110 active:scale-95 transition-all mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Criar Minha Conta"}
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground mb-4">Já possui uma conta?</p>
          <Link href="/login" className="text-primary font-black uppercase text-[10px] tracking-[0.2em] hover:underline">
            Acessar conta existente
          </Link>
        </div>
      </main>
    </div>
  );
}
