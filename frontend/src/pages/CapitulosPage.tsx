/**
 * Página Capítulos Internacionales
 * Ruta: /capitulos
 * 
 * Muestra la presencia global de L.A.M.A. con mapa interactivo,
 * listado de capítulos por región y contexto de Medellín
 */

import { useNavigate } from 'react-router-dom';
import ChaptersHero from '../components/capitulos/ChaptersHero';
import WorldMapSection from '../components/capitulos/WorldMapSection';
import RegionsGrid from '../components/capitulos/RegionsGrid';
import MedellinContext from '../components/capitulos/MedellinContext';

export default function CapitulosPage() {
  const navigate = useNavigate();

  const scrollToRegions = () => {
    const regionsSection = document.getElementById('regions-section');
    if (regionsSection) {
      regionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Hero principal */}
      <ChaptersHero />

      {/* Texto introductorio */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            La hermandad que une <span className="text-yellow-400">continentes</span>
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
            <p>
              Desde su fundación en <strong className="text-yellow-400">1977</strong>, L.A.M.A. 
              (Latin American Motorcycle Association) ha crecido hasta convertirse en una 
              <strong className="text-white"> red global de motociclistas</strong> unidos por 
              valores de hermandad, respeto, servicio y pasión por las dos ruedas.
            </p>
            <p>
              Hoy, con presencia en <strong className="text-yellow-400">más de 25 países</strong> y 
              <strong className="text-yellow-400"> 5 continentes</strong>, L.A.M.A. demuestra que 
              el mototurismo no tiene fronteras. Cada capítulo aporta su cultura, experiencia y 
              compromiso para fortalecer una <strong className="text-white">hermandad sin límites</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Mapa interactivo */}
      <WorldMapSection />

      {/* Grid de capítulos por región */}
      <RegionsGrid />

      {/* Contexto de Medellín */}
      <MedellinContext />

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Quieres formar parte de la <span className="text-yellow-400">red global</span>?
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Únete a L.A.M.A. y conecta con miles de motociclistas en todo el mundo. 
            Sin importar dónde estés, la hermandad te espera para rodar juntos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/inscripcion')}
              className="group relative px-8 py-4 bg-yellow-400 text-black font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,210,0,0.6)]"
            >
              <span className="relative z-10">Solicitar Membresía</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button 
              onClick={scrollToRegions}
              className="px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300"
            >
              Buscar Capítulo Cercano
            </button>
          </div>
        </div>

        {/* Glow decorativo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </section>
    </main>
  );
}
