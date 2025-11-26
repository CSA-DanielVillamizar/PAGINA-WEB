"use client";
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api-client';
import { API_BASE } from '../../../lib/config';

const schema = z.object({
  newPassword: z.string().min(8, 'Mínimo 8 caracteres')
});
type FormData = z.infer<typeof schema>;

function ResetPasswordInner() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const search = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(search.get('token'));
  }, [search]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('Falta token en la URL');
      return;
    }
    setError(null);
    setStatus(null);
    try {
      await api.post(`${API_BASE}/auth/reset-password`, { token, newPassword: data.newPassword });
      setStatus('Contraseña actualizada. Redirigiendo al login…');
      reset();
      setTimeout(() => router.replace('/auth/login'), 1500);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al actualizar la contraseña');
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold mb-4">Restablecer contraseña</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nueva contraseña</label>
            <input type="password" className="w-full border rounded px-3 py-2 bg-transparent" {...register('newPassword')} />
            {errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {status && <div className="text-sm text-green-700">{status}</div>}
          <button disabled={isSubmitting} className="w-full bg-black text-white py-2 rounded disabled:opacity-60">
            {isSubmitting ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
