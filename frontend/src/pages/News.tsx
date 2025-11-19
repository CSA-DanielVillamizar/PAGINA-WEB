import React, { useEffect, useState } from 'react'
import api from '@/services/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface NewsItem {
  id: string
  titulo: string
  cuerpo: string
  imagenUrl: string
  fechaPublicacion: string
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const { data } = await api.get('/news')
      setNews(data)
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto py-12">Cargando...</div>

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-8">Noticias</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <article key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div className="aspect-video bg-gray-200">
              {item.imagenUrl ? (
                <img src={item.imagenUrl} alt={item.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Sin imagen</div>
              )}
            </div>
            <div className="p-6">
              <time className="text-sm text-gray-500">
                {format(new Date(item.fechaPublicacion), "d 'de' MMMM, yyyy", { locale: es })}
              </time>
              <h3 className="font-bold text-xl mt-2 mb-3">{item.titulo}</h3>
              <p className="text-gray-700 line-clamp-3">{item.cuerpo}</p>
              <button className="mt-4 text-blue-600 hover:text-blue-800 font-semibold">
                Leer más →
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
