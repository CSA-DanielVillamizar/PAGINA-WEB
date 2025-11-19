import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            L.A.M.A. Medellín
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-blue-600 transition">Inicio</Link>
            <Link to="/about" className="hover:text-blue-600 transition">Nosotros</Link>
            <Link to="/moto-touring" className="hover:text-blue-600 transition">Moto-Touring</Link>
            <Link to="/members" className="hover:text-blue-600 transition">Miembros</Link>
            <Link to="/souvenirs" className="hover:text-blue-600 transition">Souvenirs</Link>
            <Link to="/news" className="hover:text-blue-600 transition">Noticias</Link>
            <Link to="/gallery" className="hover:text-blue-600 transition">Galería</Link>
            <Link to="/donations" className="hover:text-blue-600 transition">Donaciones</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="hover:text-blue-600 transition">Admin</Link>
                <button onClick={logout} className="hover:text-red-600 transition">
                  Cerrar Sesión ({user?.nombreCompleto})
                </button>
              </>
            ) : (
              <Link to="/inscripcion" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Inscribirse
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Inicio</Link>
            <Link to="/about" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Nosotros</Link>
            <Link to="/moto-touring" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Moto-Touring</Link>
            <Link to="/members" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Miembros</Link>
            <Link to="/souvenirs" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Souvenirs</Link>
            <Link to="/news" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Noticias</Link>
            <Link to="/gallery" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Galería</Link>
            <Link to="/donations" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Donaciones</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="block py-2 hover:text-blue-600" onClick={() => setIsOpen(false)}>Admin</Link>
                <button onClick={() => { logout(); setIsOpen(false) }} className="block w-full text-left py-2 hover:text-red-600">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link to="/inscripcion" className="block py-2 bg-blue-600 text-white text-center rounded" onClick={() => setIsOpen(false)}>
                Inscribirse
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
