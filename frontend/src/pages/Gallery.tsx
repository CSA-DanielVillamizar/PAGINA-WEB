import React, { useEffect, useState } from 'react'
import api from '@/services/api'

interface Album {
  id: string
  titulo: string
  descripcion: string
  imagenes: string[]
  fecha: string
}

export default function Gallery() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      const { data } = await api.get('/gallery')
      setAlbums(data)
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto py-12">Cargando...</div>

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-8">Galería</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {albums.map((album) => (
          <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer">
            <div className="aspect-video bg-gray-200">
              {album.imagenes.length > 0 ? (
                <img src={album.imagenes[0]} alt={album.titulo} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Sin imágenes</div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-bold text-xl mb-2">{album.titulo}</h3>
              <p className="text-gray-600 text-sm mb-2">{album.descripcion}</p>
              <p className="text-xs text-gray-500">{album.imagenes.length} fotos</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
