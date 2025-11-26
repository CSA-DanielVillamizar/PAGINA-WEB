"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { api } from '../../../lib/api-client';
import { API_BASE } from '../../../lib/config';

const schema = z.object({ email: z.string().email('Email inválido') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setStatus(null);
    try {
      await api.post(`${API_BASE}/auth/forgot-password`, { email: data.email });
      setStatus('Si el email existe, se enviará un enlace de recuperación.');
      reset();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error procesando la solicitud');
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold mb-4">Recuperar contraseña</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 bg-transparent" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {status && <div className="text-sm text-green-700">{status}</div>}
          <button disabled={isSubmitting} className="w-full bg-black text-white py-2 rounded disabled:opacity-60">
            {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </main>
  );
}
