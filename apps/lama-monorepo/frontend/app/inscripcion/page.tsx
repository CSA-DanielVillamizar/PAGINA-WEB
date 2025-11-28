'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/services/api';
import { Button } from '@/components/ui/button';

const schema = z.object({
  nombres: z.string().min(2, 'Mínimo 2 caracteres'),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres'),
  identificacion: z.string().min(5, 'Mínimo 5 caracteres'),
  direccion: z.string().optional(),
  telefonos: z.string().optional(),
  actividadLaboral: z.string().optional(),
  parejaNombre: z.string().optional(),
  hijos: z.string().optional(),
  vehiculoMarca: z.string().optional(),
  vehiculoReferencia: z.string().optional(),
  vehiculoPlaca: z.string().optional(),
  certificacionTexto: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function InscripcionPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      const res = await apiClient.post('/application-forms', data);
      setMessage(res.data.message);
      setStatus('success');
    } catch {
      setMessage('Error al enviar formulario');
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Formulario de Inscripción</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nombres *</label>
            <input {...register('nombres')} className="w-full border rounded px-3 py-2" />
            {errors.nombres && <p className="text-red-600 text-sm">{errors.nombres.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Apellidos *</label>
            <input {...register('apellidos')} className="w-full border rounded px-3 py-2" />
            {errors.apellidos && <p className="text-red-600 text-sm">{errors.apellidos.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Identificación *</label>
            <input {...register('identificacion')} className="w-full border rounded px-3 py-2" />
            {errors.identificacion && <p className="text-red-600 text-sm">{errors.identificacion.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Dirección</label>
            <input {...register('direccion')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Teléfonos</label>
            <input {...register('telefonos')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Actividad Laboral</label>
            <input {...register('actividadLaboral')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Nombre Pareja</label>
            <input {...register('parejaNombre')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Hijos</label>
            <input {...register('hijos')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Marca del Vehículo</label>
            <input {...register('vehiculoMarca')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Referencia del Vehículo</label>
            <input {...register('vehiculoReferencia')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Placa del Vehículo</label>
            <input {...register('vehiculoPlaca')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Certificación (texto de responsabilidad)</label>
            <textarea {...register('certificacionTexto')} className="w-full border rounded px-3 py-2" rows={4} />
          </div>
          <Button type="submit" disabled={status === 'loading'} className="w-full">
            {status === 'loading' ? 'Enviando...' : 'Enviar Formulario'}
          </Button>
          {status === 'success' && <p className="text-green-600">{message}</p>}
          {status === 'error' && <p className="text-red-600">{message}</p>}
        </form>
      </div>
    </main>
  );
}
