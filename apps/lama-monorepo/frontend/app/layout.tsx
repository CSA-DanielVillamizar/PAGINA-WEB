import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'Fundación L.A.M.A. Medellín',
  description: 'Mototurismo con propósito. Cultura que deja huella.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="scrollbar-adventure">
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
