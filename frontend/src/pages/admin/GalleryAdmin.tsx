import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/services/api'

interface Album {
  id: string
  titulo: string
  descripcion: string
  imagenes: string[]
}

export default function GalleryAdmin() {
  const [albums, setAlbums] = useState<Album[]>([])
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      const { data } = await api.get('/gallery')
      setAlbums(data)
    } catch (error) {
      console.error('Error loading albums:', error)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      await api.post('/gallery', {
        ...data,
        imagenes: [],
        fecha: new Date().toISOString()
      })
      reset()
      loadAlbums()
    } catch (error) {
      console.error('Error creating album:', error)
    }
  }

  const addImage = async (albumId: string) => {
    const url = prompt('Ingresa la URL de la imagen:')
    if (url) {
      try {
        await api.post(`/gallery/${albumId}/images`, { url })
        loadAlbums()
      } catch (error) {
        console.error('Error adding image:', error)
      }
    }
  }

  const deleteAlbum = async (id: string) => {
    if (confirm('¿Eliminar este álbum?')) {
      try {
        await api.delete(`/gallery/${id}`)
        loadAlbums()
      } catch (error) {
        console.error('Error deleting album:', error)
      }
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Galería</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Crear Álbum</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            {...register('titulo', { required: true })}
            placeholder="Título del álbum"
            className="px-3 py-2 border rounded"
          />
          <input
            {...register('descripcion')}
            placeholder="Descripción"
            className="px-3 py-2 border rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Crear Álbum
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div key={album.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {album.imagenes.length > 0 ? (
                <img src={album.imagenes[0]} alt={album.titulo} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">Sin imágenes</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">{album.titulo}</h3>
              <p className="text-sm text-gray-600 mb-3">{album.descripcion}</p>
              <p className="text-xs text-gray-500 mb-3">{album.imagenes.length} fotos</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => addImage(album.id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700"
                >
                  + Foto
                </button>
                <button 
                  onClick={() => deleteAlbum(album.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
