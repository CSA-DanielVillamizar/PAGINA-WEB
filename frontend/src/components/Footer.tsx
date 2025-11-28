import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

/**
 * Footer institucional de la Fundación L.A.M.A. Medellín
 * Diseño Adventure con 3 columnas: Info, Enlaces, Contacto
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-black border-t border-primary/20"
    >
      <div className="container-adventure py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Logo e Información */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center glow-adventure-sm">
                <span className="text-primary font-bold text-xl">L</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">L.A.M.A.</h3>
                <p className="text-gray-400 text-sm">Fundación Medellín</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Mototurismo con propósito. Cultura que deja huella. Unidos por la aventura y el servicio a la comunidad.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/LAMAMEDELLIN"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-adventure"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/lamamedellin/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-adventure"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://youtube.com/@fundacionlama"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-adventure"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/moto-touring" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Mototour
                </Link>
              </li>
              <li>
                <Link to="/members" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Miembros
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Noticias
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/souvenirs" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Souvenirs
                </Link>
              </li>
              <li>
                <Link to="/donations" className="text-gray-400 hover:text-primary transition-adventure text-sm">
                  Donaciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Mail size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@fundacionlamamedellin.org"
                  className="text-gray-400 hover:text-primary transition-adventure"
                >
                  info@fundacionlamamedellin.org
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+573001234567"
                  className="text-gray-400 hover:text-primary transition-adventure"
                >
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  Medellín, Antioquia<br />
                  Colombia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-primary/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} Fundación L.A.M.A. Medellín. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-500 hover:text-primary transition-adventure">
                Privacidad
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-primary transition-adventure">
                Términos
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-primary transition-adventure">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
