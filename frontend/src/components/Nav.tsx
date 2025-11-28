import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { Menu, X, User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showImpactoMenu, setShowImpactoMenu] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout, hasAnyRole } = useAuthStore();

  const hasAdminAccess = hasAnyRole([
    'Administrador',
    'Presidente',
    'Vicepresidente',
    'GerenciaNegocios'
  ]);

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/about', label: 'Nosotros' },
    { to: '/historia', label: 'Historia' },
    { to: '/moto-touring', label: 'Mototour' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/members', label: 'Miembros' },
    { to: '/gallery', label: 'Galería' },
    { to: '/news', label: 'Noticias' },
    { to: '/souvenirs', label: 'Souvenirs' },
    { to: '/donations', label: 'Donaciones' },
  ];

  const impactoLinks = [
    { to: '/impacto', label: 'Impacto Social' },
    { to: '/damas', label: 'Damas de L.A.M.A.' },
    { to: '/capitulos', label: 'Capítulos Internacionales' },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  const isImpactoActive = impactoLinks.some(link => isActive(link.to));

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-primary/20">
      <div className="container-adventure">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center glow-adventure-sm"
            >
              <span className="text-primary font-bold text-2xl">L</span>
            </motion.div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-xl">L.A.M.A.</div>
              <div className="text-gray-400 text-xs">Capítulo y Fundación Medellín</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-adventure ${
                  isActive(link.to) ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </Link>
            ))}
            
            {/* Menú Impacto Social (Dropdown) */}
            <div 
              className="relative"
              onMouseEnter={() => setShowImpactoMenu(true)}
              onMouseLeave={() => setShowImpactoMenu(false)}
            >
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-adventure ${
                  isImpactoActive ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                Más Secciones
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showImpactoMenu ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showImpactoMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-64 card-adventure py-2 border border-primary/20"
                  >
                    {impactoLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`block px-4 py-2.5 text-sm transition-adventure ${
                          isActive(link.to)
                            ? 'text-primary bg-primary/10'
                            : 'text-gray-400 hover:text-white hover:bg-secondary/50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User Menu / CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-adventure"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {user?.nombreCompleto?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-white text-sm font-medium">{user?.nombreCompleto}</div>
                    <div className="text-gray-400 text-xs">{user?.rol}</div>
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 card-adventure py-2"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-primary hover:bg-secondary/50 transition-adventure"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={18} />
                        Mi Perfil
                      </Link>
                      {hasAdminAccess && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-primary hover:bg-secondary/50 transition-adventure"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard size={18} />
                          Panel Admin
                        </Link>
                      )}
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-primary hover:bg-secondary/50 transition-adventure"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={18} />
                        Configuración
                      </Link>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-secondary/50 transition-adventure w-full"
                      >
                        <LogOut size={18} />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/inscripcion" className="btn-adventure">
                Únete
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-adventure"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-4 space-y-2"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2 px-4 rounded-lg transition-adventure ${
                    isActive(link.to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-400 hover:bg-secondary hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Menú Impacto Social Mobile */}
              <div className="border-t border-border my-2 pt-2">
                <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  Impacto y Hermandad
                </div>
                {impactoLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 px-4 rounded-lg transition-adventure ${
                      isActive(link.to)
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-400 hover:bg-secondary hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              {isAuthenticated ? (
                <>
                  <div className="border-t border-border my-2 pt-2">
                    <div className="px-4 py-2 text-sm text-gray-400">
                      {user?.nombreCompleto} • {user?.rol}
                    </div>
                  </div>
                  {hasAdminAccess && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block py-2 px-4 rounded-lg text-gray-400 hover:bg-secondary hover:text-primary transition-adventure"
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left py-2 px-4 rounded-lg text-red-400 hover:bg-secondary hover:text-red-300 transition-adventure"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  to="/inscripcion"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 px-4 rounded-lg bg-primary text-black font-semibold text-center"
                >
                  Únete
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
