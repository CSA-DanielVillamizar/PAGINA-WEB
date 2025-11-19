import React, { useEffect, useState } from 'react'
import api from '@/services/api'

interface Souvenir {
  id: string
  nombre: string
  precio: number
  inventario: number
  categoria: string
}

export default function SouvenirsAdmin() {
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

  const updateInventory = async (id: string, cantidad: number) => {
    try {
      await api.post(`/souvenirs/${id}/inventory`, { cantidad })
      loadSouvenirs()
    } catch (error) {
      console.error('Error updating inventory:', error)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Souvenirs</h1>
      
      <button className="mb-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        + Agregar Souvenir
      </button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inventario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {souvenirs.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{item.nombre}</td>
                <td className="px-6 py-4 text-sm">{item.categoria}</td>
                <td className="px-6 py-4 text-sm">${item.precio.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`font-semibold ${item.inventario < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.inventario}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Editar</button>
                  <button 
                    onClick={() => updateInventory(item.id, -1)} 
                    className="text-orange-600 hover:text-orange-800"
                  >
                    -1
                  </button>
                  <button 
                    onClick={() => updateInventory(item.id, 1)} 
                    className="text-green-600 hover:text-green-800"
                  >
                    +1
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
