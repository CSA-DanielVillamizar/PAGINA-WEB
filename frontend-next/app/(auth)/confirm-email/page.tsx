"use client";
export const dynamic = 'force-dynamic';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api-client';
import { API_BASE } from '../../../lib/config';

function ConfirmEmailInner() {
  const search = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'ok' | 'error' | 'processing'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const token = search.get('token');
    if (token) {
      setStatus('processing');
      api.post(`${API_BASE}/auth/confirm-email`, { token })
        .then(() => {
          setStatus('ok');
          setMessage('Email confirmado. Ya puedes iniciar sesión.');
          setTimeout(() => router.replace('/auth/login'), 2000);
        })
        .catch((e) => {
          setStatus('error');
          setMessage(e?.response?.data?.message || 'Token inválido o expirado');
        });
    }
  }, [search, router]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold mb-4">Confirmar correo</h1>
        {status === 'idle' && (
          <p className="text-sm">Falta el parámetro token en la URL.</p>
        )}
        {status === 'processing' && (
          <p className="text-sm">Confirmando…</p>
        )}
        {status !== 'idle' && status !== 'processing' && (
          <p className={status === 'ok' ? 'text-green-700' : 'text-red-600'}>{message}</p>
        )}
      </div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <ConfirmEmailInner />
    </Suspense>
  );
}
