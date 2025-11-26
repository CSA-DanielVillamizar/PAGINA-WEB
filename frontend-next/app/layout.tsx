import './globals.css';
import { ReactNode } from 'react';
import Providers from '../components/Providers';

export const metadata = {
  title: 'Fundación L.A.M.A. Medellín',
  description: 'Mototurismo con propósito. Somos un legado en movimiento.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
