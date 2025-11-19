import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/services/api'

interface NewsItem {
  id: string
  titulo: string
  cuerpo: string
  fechaPublicacion: string
}

export default function NewsAdmin() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const { data } = await api.get('/news')
      setNews(data)
    } catch (error) {
      console.error('Error loading news:', error)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await api.patch(`/news/${editingId}`, data)
      } else {
        await api.post('/news', { ...data, fechaPublicacion: new Date().toISOString() })
      }
      reset()
      setEditingId(null)
      loadNews()
    } catch (error) {
      console.error('Error saving news:', error)
    }
  }

  const deleteNews = async (id: string) => {
    if (confirm('¿Eliminar esta noticia?')) {
      try {
        await api.delete(`/news/${id}`)
        loadNews()
      } catch (error) {
        console.error('Error deleting news:', error)
      }
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Noticias</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Noticia' : 'Nueva Noticia'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                {...register('titulo', { required: true })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Contenido</label>
              <textarea
                {...register('cuerpo', { required: true })}
                rows={8}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">URL Imagen</label>
              <input
                {...register('imagenUrl')}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {editingId ? 'Actualizar' : 'Publicar'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { reset(); setEditingId(null) }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Noticias Publicadas</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {news.map((item) => (
              <div key={item.id} className="border rounded p-4">
                <h3 className="font-bold mb-2">{item.titulo}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.cuerpo}</p>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setEditingId(item.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => deleteNews(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
