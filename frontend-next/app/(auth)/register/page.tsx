"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { API_BASE } from '../../../lib/config';
import { api } from '../../../lib/api-client';

const schema = z.object({
  fullName: z.string().min(3, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setDone(null);
    try {
      await api.post(`${API_BASE}/auth/register`, {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
      setDone('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
      reset();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error registrando usuario');
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold mb-4">Crear cuenta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nombre completo</label>
            <input className="w-full border rounded px-3 py-2 bg-transparent" {...register('fullName')} />
            {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>}
          </div>
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
          {done && <div className="text-sm text-green-700">{done}</div>}
          <button disabled={isSubmitting} className="w-full bg-black text-white py-2 rounded disabled:opacity-60">
            {isSubmitting ? 'Registrando…' : 'Registrarme'}
          </button>
        </form>
        <div className="mt-4 text-sm">
          <a className="underline" href="/auth/login">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
    </main>
  );
}
