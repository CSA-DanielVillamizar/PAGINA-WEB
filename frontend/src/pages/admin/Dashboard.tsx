import React, { useEffect, useState } from 'react'
import api from '@/services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalDonations: 0,
    totalSubscriptions: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Cargar estadísticas desde el backend
      const [users, events, donations, subscriptions] = await Promise.all([
        api.get('/users'),
        api.get('/events'),
        api.get('/donations/total'),
        api.get('/subscriptions')
      ])
      setStats({
        totalUsers: users.data.length || 0,
        totalEvents: events.data.length || 0,
        totalDonations: donations.data.total || 0,
        totalSubscriptions: subscriptions.data.length || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm mb-2">Usuarios Registrados</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm mb-2">Eventos Activos</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalEvents}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm mb-2">Total Donaciones</h3>
          <p className="text-3xl font-bold text-yellow-600">${stats.totalDonations.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm mb-2">Suscriptores</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalSubscriptions}</p>
        </div>
      </div>
    </div>
  )
}
