import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/services/api'

interface SubscribeForm {
  correo: string
}

export default function Subscribe() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubscribeForm>()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const onSubmit = async (data: SubscribeForm) => {
    setSubmitting(true)
    setMessage(null)
    try {
      const response = await api.post('/subscriptions/subscribe', data)
      setMessage({ type: 'success', text: response.data.message || '¡Suscripción exitosa!' })
      reset()
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error al suscribirse'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Suscríbete a nuestro boletín</h2>
        <p className="text-gray-600 mb-8">
          Recibe noticias, eventos y novedades de L.A.M.A. Medellín directamente en tu correo.
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-400' 
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              {...register('correo', { 
                required: 'Campo requerido', 
                pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } 
              })}
              type="email"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="tu@email.com"
            />
            {errors.correo && <span className="text-red-500 text-sm block mt-1">{errors.correo.message}</span>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Suscribirse'}
          </button>
        </form>
      </div>
    </section>
  )
}
