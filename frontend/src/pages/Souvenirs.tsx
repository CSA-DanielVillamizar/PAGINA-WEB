import React, { useEffect, useState } from 'react'
import api from '@/services/api'

interface Souvenir {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagenUrl: string
  inventario: number
  categoria: string
}

export default function Souvenirs() {
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSouvenirs()
  }, [])

  const loadSouvenirs = async () => {
    try {
      const { data } = await api.get('/souvenirs')
      setSouvenirs(data)
    } catch (error) {
      console.error('Error loading souvenirs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto py-12">Cargando...</div>

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-8">Souvenirs L.A.M.A.</h2>
      <p className="text-gray-600 mb-8">Productos oficiales de la Fundación L.A.M.A. Medellín</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {souvenirs.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              {item.imagenUrl ? (
                <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">Sin imagen</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.nombre}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.descripcion}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">${item.precio.toFixed(2)}</span>
                <span className="text-sm text-gray-500">{item.inventario} disponibles</span>
              </div>
              <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Consultar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
