import React, { useEffect, useState } from 'react'
import api from '@/services/api'

interface User {
  id: string
  nombreCompleto: string
  correo: string
  telefono: string
  capitulo: string
  estado: string
  roles: Array<{ name: string }>
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Cargando usuarios...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capítulo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{user.nombreCompleto}</td>
                <td className="px-6 py-4 text-sm">{user.correo}</td>
                <td className="px-6 py-4 text-sm">{user.capitulo}</td>
                <td className="px-6 py-4 text-sm">
                  {user.roles.map(r => r.name).join(', ')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.estado === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">Editar</button>
                  <button className="text-red-600 hover:text-red-800">Desactivar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
