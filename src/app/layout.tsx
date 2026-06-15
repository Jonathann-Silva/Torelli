import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { NotificationHandler } from '@/components/NotificationHandler';
import { AuthGuard } from '@/components/AuthGuard';

const logoUrl = "https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1";

export const metadata: Metadata = {
  title: 'Barber Torelli | Premium Barbershop',
  description: 'Experiência de cuidado premium para o homem moderno.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Barber Torelli',
  },
  icons: {
    icon: logoUrl,
    apple: logoUrl,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#ffbf00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href={logoUrl} />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary bg-black">
        <FirebaseClientProvider>
          <div className="max-w-[480px] mx-auto min-h-screen bg-background shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-x-hidden">
            <NotificationHandler />
            <AuthGuard>
              {children}
            </AuthGuard>
            <Toaster />
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
