/**
 * Página Damas de L.A.M.A.
 * Ruta: /damas
 * 
 * Destaca el rol protagónico de las mujeres en L.A.M.A.
 * con lideresas, logros y mensaje institucional
 */

import { useNavigate } from 'react-router-dom';
import DamasHero from '../components/damas/DamasHero';
import DamasHighlightGrid from '../components/damas/DamasHighlightGrid';
import DamasQuote from '../components/damas/DamasQuote';

export default function DamasPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-black">
      {/* Hero principal */}
      <DamasHero />

      {/* Descripción institucional */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Mujeres que <span className="text-yellow-400">transforman</span> el mototurismo
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
            <p>
              En L.A.M.A., las mujeres no son pasajeras: son <strong className="text-yellow-400">protagonistas</strong>. 
              Desde la fundación en 1977, las Damas de L.A.M.A. han recorrido cientos de miles de kilómetros, 
              han liderado capítulos, organizado eventos internacionales y han sido campeonas en 
              competencias de resistencia y habilidad.
            </p>
            <p>
              Cada una aporta su <strong className="text-yellow-400">fuerza, carácter y experiencia</strong> para 
              construir una hermandad donde el respeto, la igualdad y la pasión son los motores principales. 
              Son referentes, maestras, líderes y, sobre todo, <strong className="text-yellow-400">hermanas de ruta</strong>.
            </p>
            <p>
              En el mototurismo internacional, las Damas de L.A.M.A. han demostrado que 
              <strong className="text-yellow-400"> no hay límites ni fronteras</strong> para quien tiene la determinación 
              de conquistar su propio camino sobre dos ruedas.
            </p>
          </div>
        </div>
      </section>

      {/* Grid de Damas destacadas */}
      <DamasHighlightGrid />

      {/* Quote institucional */}
      <DamasQuote />

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Eres pilota y quieres ser parte de la <span className="text-yellow-400">hermandad</span>?
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Únete a L.A.M.A. y forma parte de una red mundial de mujeres que lideran, 
            recorren y transforman el mototurismo. Sin importar tu experiencia, tu nacionalidad 
            o tu moto: lo que importa es tu pasión y tu compromiso.
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
              onClick={() => navigate('/requisitos-membresia')}
              className="px-8 py-4 bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300"
            >
              Conocer Requisitos
            </button>
          </div>
        </div>

        {/* Glow decorativo */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />
      </section>
    </main>
  );
}
