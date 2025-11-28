          <Link to="/admin/ranking" className="block py-2 px-4 rounded hover:bg-gray-700">
            Ranking Asistencia
          </Link>
import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { isAuthenticated, hasAnyRole } = useAuthStore()

  useEffect(() => {
    // Verificar autenticación y roles de administrador
    if (!isAuthenticated || !hasAnyRole(['Administrador', 'Presidente', 'Vicepresidente', 'GerenciaNegocios'])) {
      navigate('/')
    }
  }, [isAuthenticated, hasAnyRole, navigate])

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Panel Admin</h2>
        </div>
        <nav className="space-y-2 px-4">
          <Link to="/admin" className="block py-2 px-4 rounded hover:bg-gray-700">
            Dashboard
          </Link>
          <Link to="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-700">
            Usuarios
          </Link>
          <Link to="/admin/events" className="block py-2 px-4 rounded hover:bg-gray-700">
            Eventos
          </Link>
          <Link to="/admin/souvenirs" className="block py-2 px-4 rounded hover:bg-gray-700">
            Souvenirs
          </Link>
          <Link to="/admin/news" className="block py-2 px-4 rounded hover:bg-gray-700">
            Noticias
          </Link>
          <Link to="/admin/gallery" className="block py-2 px-4 rounded hover:bg-gray-700">
            Galería
          </Link>
          <Link to="/admin/projects" className="block py-2 px-4 rounded hover:bg-gray-700">
            Proyectos Destacados
          </Link>
          <Link to="/admin/reports" className="block py-2 px-4 rounded hover:bg-gray-700">
            Reportes
          </Link>
          <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-700 mt-6 border-t border-gray-700 pt-4">
            ← Volver al sitio
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
