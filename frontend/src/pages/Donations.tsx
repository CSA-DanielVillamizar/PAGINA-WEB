import { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/services/api'

interface DonationForm {
  nombreDonante: string
  correo: string
  monto: number
  metodoPago: string
  mensaje?: string
}

export default function Donations() {
  const { register, handleSubmit, reset, formState: { errors }, getValues } = useForm<DonationForm>()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  // Número oficial del tesorero (fallback si no hay env VITE_WHATSAPP_NUMBER)
  const whatsappNumber = (import.meta as any).env?.VITE_WHATSAPP_NUMBER || '573105127314'

  const onSubmit = async (data: DonationForm) => {
    setSubmitting(true)
    try {
      await api.post('/donations', data)
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 6000)
    } catch (error) {
      console.warn('Backend no disponible, usando fallback de correo:', error)
      const subject = encodeURIComponent('Donación Fundación L.A.M.A. Medellín')
      const body = encodeURIComponent(
        `Hola,
\nQuiero realizar una donación.
\nNombre: ${data.nombreDonante}
Correo: ${data.correo}
Monto (COP): ${data.monto}
Método de pago: ${data.metodoPago}
${data.mensaje ? `Mensaje: ${data.mensaje}\n` : ''}
\nPor favor indíquenme los pasos a seguir.
\nGracias.`
      )
      window.location.href = `mailto:gerencia@fundacionlamamedellin.org?subject=${subject}&body=${body}`
    } finally {
      setSubmitting(false)
    }
  }

  const openWhatsApp = (prefill?: Partial<DonationForm>) => {
    const nombre = prefill?.nombreDonante || ''
    const correo = prefill?.correo || ''
    const monto = prefill?.monto ? prefill.monto.toString() : ''
    const metodo = prefill?.metodoPago || ''
    const mensaje = prefill?.mensaje || ''
    const text = encodeURIComponent(
      `Hola, quiero realizar una donación a la Fundación L.A.M.A. Medellín.%0A` +
      (nombre ? `Nombre: ${nombre}%0A` : '') +
      (correo ? `Correo: ${correo}%0A` : '') +
      (monto ? `Monto (COP): ${monto}%0A` : '') +
      (metodo ? `Método de pago: ${metodo}%0A` : '') +
      (mensaje ? `Mensaje: ${mensaje}%0A` : '') +
      `%0A¿Me indican los pasos a seguir?`
    )
    const base = whatsappNumber ? `https://wa.me/${whatsappNumber}` : 'https://wa.me/'
    window.open(`${base}?text=${text}`, '_blank')
  }

  return (
    <section className="container mx-auto py-12 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Donaciones</h2>
        <p className="text-gray-600 mb-8">
          Tu contribución nos ayuda a seguir promoviendo el moto-touring responsable y 
          apoyando causas sociales en nuestra comunidad.
        </p>

        {/* Información bancaria oficial */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Cuenta oficial para donaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Banco:</span>
              <span className="text-gray-900 ml-2">Bancolombia</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Tipo de cuenta:</span>
              <span className="text-gray-900 ml-2">Ahorros</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Número:</span>
              <span className="text-gray-900 ml-2 font-mono">23000013774</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Titular:</span>
              <span className="text-gray-900 ml-2">Fundación L.A.M.A. Medellín</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold text-gray-700">NIT:</span>
              <span className="text-gray-900 ml-2">900.007.705</span>
            </div>
          </div>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            ¡Gracias por tu donación! La hemos registrado exitosamente.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre completo</label>
            <input
              {...register('nombreDonante', { required: 'Campo requerido' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              placeholder="Tu nombre"
            />
            {errors.nombreDonante && <span className="text-red-500 text-sm">{errors.nombreDonante.message}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Correo electrónico</label>
            <input
              {...register('correo', { required: 'Campo requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } })}
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              placeholder="tu@email.com"
            />
            {errors.correo && <span className="text-red-500 text-sm">{errors.correo.message}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Monto (COP)</label>
            <input
              {...register('monto', { required: 'Campo requerido', min: { value: 1000, message: 'Monto mínimo: $1,000' } })}
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
              placeholder="50000"
            />
            {errors.monto && <span className="text-red-500 text-sm">{errors.monto.message}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Método de pago</label>
            <select
              {...register('metodoPago', { required: 'Campo requerido' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
            >
              <option value="">Selecciona...</option>
              <option value="Tarjeta">Tarjeta de crédito/débito</option>
              <option value="PSE">PSE</option>
              <option value="Efectivo">Efectivo</option>
            </select>
            {errors.metodoPago && <span className="text-red-500 text-sm">{errors.metodoPago.message}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Mensaje (opcional)</label>
            <textarea
              {...register('mensaje')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white resize-none"
              placeholder="Comentarios adicionales, intención de la donación, datos de contacto..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? 'Procesando...' : 'Donar'}
            </button>
            <button
              type="button"
              onClick={() => openWhatsApp(getValues())}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Contactar por WhatsApp
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
