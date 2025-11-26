"use client";
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      const next = search.get('next');
      router.replace(next || '/admin');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Credenciales inválidas');
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold mb-4">Iniciar sesión</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 bg-transparent" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input type="password" className="w-full border rounded px-3 py-2 bg-transparent" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={isSubmitting} className="w-full bg-black text-white py-2 rounded disabled:opacity-60">
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <div className="mt-4 text-sm flex justify-between">
          <a className="underline" href="/auth/forgot-password">¿Olvidaste tu contraseña?</a>
          <a className="underline" href="/auth/register">Crear cuenta</a>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <LoginInner />
    </Suspense>
  );
}
