
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Torelli Agendamentos | Premium Barbershop',
  description: 'Experiência de cuidado premium para o homem moderno.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary bg-black">
        <FirebaseClientProvider>
          {/* Mobile Container Frame for Desktop Viewport */}
          <div className="max-w-[480px] mx-auto min-h-screen bg-background shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-x-hidden">
            {children}
            <Toaster />
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
