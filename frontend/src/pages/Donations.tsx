import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/services/api'

interface DonationForm {
  nombreDonante: string
  correo: string
  monto: number
  metodoPago: string
}

export default function Donations() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DonationForm>()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const onSubmit = async (data: DonationForm) => {
    setSubmitting(true)
    try {
      await api.post('/donations', data)
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting donation:', error)
      alert('Error al procesar la donación')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">Donaciones</h2>
        <p className="text-gray-600 mb-8">
          Tu contribución nos ayuda a seguir promoviendo el moto-touring responsable y 
          apoyando causas sociales en nuestra comunidad.
        </p>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            ¡Gracias por tu donación! La hemos registrado exitosamente.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Nombre completo</label>
            <input
              {...register('nombreDonante', { required: 'Campo requerido' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tu nombre"
            />
            {errors.nombreDonante && <span className="text-red-500 text-sm">{errors.nombreDonante.message}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Correo electrónico</label>
            <input
              {...register('correo', { required: 'Campo requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="tu@email.com"
            />
            {errors.correo && <span className="text-red-500 text-sm">{errors.correo.message}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Monto (COP)</label>
            <input
              {...register('monto', { required: 'Campo requerido', min: { value: 1000, message: 'Monto mínimo: $1,000' } })}
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="50000"
            />
            {errors.monto && <span className="text-red-500 text-sm">{errors.monto.message}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Método de pago</label>
            <select
              {...register('metodoPago', { required: 'Campo requerido' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Selecciona...</option>
              <option value="Tarjeta">Tarjeta de crédito/débito</option>
              <option value="PSE">PSE</option>
              <option value="Efectivo">Efectivo</option>
            </select>
            {errors.metodoPago && <span className="text-red-500 text-sm">{errors.metodoPago.message}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Procesando...' : 'Donar'}
          </button>
        </form>
      </div>
    </section>
  )
}
