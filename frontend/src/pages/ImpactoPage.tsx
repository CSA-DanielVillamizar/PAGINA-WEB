/**
 * Página Impacto Social
 * Ruta: /impacto
 * 
 * Muestra el impacto social de la Fundación L.A.M.A. Medellín
 * con métricas, proyectos destacados e historias de beneficiarios
 */

import { useNavigate } from 'react-router-dom';
import ImpactHero from '../components/impacto/ImpactHero';
import ImpactStats from '../components/impacto/ImpactStats';
import ProjectsGrid from '../components/impacto/ProjectsGrid';
import StoriesCarousel from '../components/impacto/StoriesCarousel';

export default function ImpactoPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-black">
      {/* Hero principal */}
      <ImpactHero />

      {/* Estadísticas de impacto */}
      <ImpactStats />

      {/* Proyectos destacados */}
      <ProjectsGrid />

      {/* Testimonios e historias */}
      <StoriesCarousel />

      {/* Call to Action final */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Quieres ser parte del <span className="text-yellow-400">cambio</span>?
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Únete a nuestra labor social. Cada acción cuenta, cada kilómetro suma, 
            cada donación transforma vidas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/donations')}
              className="group relative px-8 py-4 bg-yellow-400 text-black font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,210,0,0.6)]"
            >
              <span className="relative z-10">Hacer una Donación</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button 
              onClick={() => navigate('/inscripcion')}
              className="px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300"
            >
              Ser Voluntario
            </button>
          </div>
        </div>

        {/* Glow decorativo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      </section>
    </main>
  );
}
