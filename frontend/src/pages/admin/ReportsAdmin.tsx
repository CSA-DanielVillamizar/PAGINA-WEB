import React, { useState } from 'react'
import api from '@/services/api'

export default function ReportsAdmin() {
  const [loading, setLoading] = useState(false)

  const generateReport = async (reportType: string, format: 'csv' | 'pdf') => {
    setLoading(true)
    try {
      const response = await api.get(`/reports/${reportType}`, {
        params: { format },
        responseType: 'blob'
      })
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportType}_${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    { id: 'users', name: 'Usuarios', description: 'Listado completo de usuarios registrados' },
    { id: 'members', name: 'Miembros', description: 'Perfiles de miembros activos' },
    { id: 'events', name: 'Eventos', description: 'Historial de eventos realizados' },
    { id: 'donations', name: 'Donaciones', description: 'Registro de donaciones recibidas' },
    { id: 'souvenirs', name: 'Inventario', description: 'Estado del inventario de souvenirs' },
    { id: 'subscriptions', name: 'Suscriptores', description: 'Lista de suscriptores al boletín' }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Generación de Reportes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{report.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{report.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => generateReport(report.id, 'csv')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Exportar CSV
              </button>
              <button
                onClick={() => generateReport(report.id, 'pdf')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Exportar PDF
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg">Generando reporte...</p>
          </div>
        </div>
      )}
    </div>
  )
}
