"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTokens } from '../../lib/auth';

/**
 * Componente de protección para rutas privadas.
 * Redirige a /auth/login si no hay accessToken.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/auth/login?next=${next}`);
    }
  }, [router, params]);

  return <>{children}</>;
}
