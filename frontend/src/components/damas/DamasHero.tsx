/**
 * DamasHero Component
 * Hero principal de la sección Damas de L.A.M.A.
 * Resalta el rol protagónico de las mujeres en el mototurismo
 */

import { motion } from 'framer-motion';
import { Award, MapPin, Trophy, Heart } from 'lucide-react';

export default function DamasHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Fondo con imagen placeholder */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/placeholder-damas.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #FFD200 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Tag superior con icono de corazón */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 via-yellow-400/10 to-purple-500/10 border border-yellow-400/30 text-yellow-400 text-sm font-semibold">
              <Heart className="w-4 h-4 fill-current" />
              Damas de L.A.M.A.
            </span>
          </motion.div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white">Damas de L.A.M.A.:</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              fuerza, carácter y kilómetros de historia
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Mujeres que no van atrás: lideran, inspiran y conquistan su propio camino 
            sobre dos ruedas. Pilotos, campeonas, líderes y referentes en el mototurismo mundial.
          </p>

          {/* Stats rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: MapPin, value: '25+', label: 'Países', color: 'from-pink-500 to-purple-500' },
              { icon: Trophy, value: '150+', label: 'Campeonatos', color: 'from-yellow-400 to-amber-500' },
              { icon: Award, value: '500K+', label: 'Kilómetros', color: 'from-cyan-500 to-blue-500' },
              { icon: Heart, value: '1977', label: 'Desde', color: 'from-red-500 to-pink-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 mb-2`}>
                  <stat.icon className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>

                {/* Glow en hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(255,210,0,0.3)]" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Línea decorativa */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-12"
          />
        </motion.div>
      </div>

      {/* Efectos de glow decorativos */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
    </section>
  );
}
