
"use client"

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { User as UserIcon, Mail, Phone, Lock, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

export default function MeusDadosPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const defaultImage = PlaceHolderImages.find(img => img.id === 'client1')?.imageUrl || '';
  
  const [profileImage, setProfileImage] = useState(defaultImage);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Carrega os dados iniciais do usuário
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setProfileImage(user.photoURL || defaultImage);

      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPhone(docSnap.data().phone || '');
          }
        } catch (error) {
          console.error("Erro ao buscar dados adicionais:", error);
        }
      };
      fetchUserData();
    }
  }, [user, db, defaultImage]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    // Limita a 11 dígitos
    if (value.length > 11) value = value.substring(0, 11);

    // Aplica o espaço após o DDD
    if (value.length > 2) {
      value = value.substring(0, 2) + ' ' + value.substring(2);
    }
    
    setPhone(value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast({
          title: "Foto carregada",
          description: "Clique em salvar para confirmar a alteração.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoAction = () => {
    // Se a imagem atual for diferente da imagem do perfil ou da padrão, volta pro estado anterior
    const currentPhoto = user?.photoURL || defaultImage;
    if (profileImage === currentPhoto) {
      fileInputRef.current?.click();
    } else {
      setProfileImage(currentPhoto);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({
        title: "Alteração descartada",
        description: "A foto voltou ao estado anterior.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar alterações.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // 1. Atualizar Perfil no Auth (Nome e Foto)
      await updateProfile(user, {
        displayName: displayName,
        photoURL: profileImage
      });

      // 2. Atualizar E-mail se mudou
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // 3. Atualizar Senha se foi digitada
      if (password && password !== '********') {
        await updatePassword(user, password);
      }

      // 4. Salvar dados no Firestore (Telefone e outros campos)
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName,
        email,
        phone,
        photoURL: profileImage,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Dados atualizados!",
        description: "Suas informações foram salvas com sucesso no banco de dados.",
      });
      
      router.push('/login'); // Volta para a página de perfil
    } catch (error: any) {
      console.error(error);
      let message = "Ocorreu um erro ao salvar seus dados.";
      
      if (error.code === 'auth/requires-recent-login') {
        message = "Por segurança, faça login novamente antes de alterar e-mail ou senha.";
      }

      toast({
        title: "Erro ao salvar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Header />
      
      <main className="max-w-[480px] mx-auto px-5 pt-24 pb-32 space-y-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary p-1 bg-secondary/30">
              <Image 
                src={profileImage} 
                alt="Profile" 
                width={128} 
                height={128} 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
            
            <button 
              type="button"
              onClick={handlePhotoAction}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg transition-transform active:scale-95 amber-glow"
            >
              {profileImage === (user?.photoURL || defaultImage) ? <Camera size={20} /> : <X size={20} />}
            </button>
          </div>
          <h2 className="text-2xl font-black text-white mt-6 tracking-tight">Meus Dados</h2>
          <p className="text-xs font-medium text-muted-foreground opacity-70 uppercase tracking-widest mt-1">Gerencie suas informações pessoais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Nome Completo</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  placeholder="Seu nome"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
                <UserIcon className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">E-mail</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Telefone</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  placeholder="00 000000000"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                <Phone className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Senha</Label>
              <div className="relative">
                <Input 
                  className="bg-[#1A1A1A] border-white/5 rounded-xl h-14 px-4 focus:ring-primary focus:border-primary transition-all text-white"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute right-4 top-4 text-muted-foreground/40" size={20} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest amber-glow hover:brightness-110 active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-14 rounded-xl border-primary/20 text-primary font-black uppercase tracking-widest hover:bg-primary/5"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
