/**
 * ChaptersHero Component
 * Hero principal de la sección Capítulos Internacionales
 * Muestra el alcance global de L.A.M.A.
 */

import { motion } from 'framer-motion';
import { Globe, MapPin, Users, Flag } from 'lucide-react';

export default function ChaptersHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Fondo con mapa del mundo sutil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/world-map.svg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Puntos brillantes animados simulando capítulos */}
      <div className="absolute inset-0">
        {[
          { top: '30%', left: '20%', delay: 0 },
          { top: '45%', left: '75%', delay: 0.2 },
          { top: '55%', left: '15%', delay: 0.4 },
          { top: '40%', left: '50%', delay: 0.6 },
          { top: '60%', left: '80%', delay: 0.8 },
          { top: '35%', left: '65%', delay: 1.0 },
        ].map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              delay: point.delay,
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(255,210,0,0.8)]"
            style={{ top: point.top, left: point.left }}
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Tag superior */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-sm font-semibold">
              <Globe className="w-4 h-4" />
              Red Internacional
            </span>
          </motion.div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white">Una hermandad</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent">
              sin fronteras
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Más de 25 naciones y 5 continentes unidos por una sola pasión: 
            <span className="text-yellow-400 font-semibold"> rodar y servir</span>.
          </p>

          {/* Stats globales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Globe, value: '5', label: 'Continentes', color: 'from-blue-500 to-cyan-500' },
              { icon: Flag, value: '25+', label: 'Países', color: 'from-green-500 to-emerald-500' },
              { icon: Users, value: '10K+', label: 'Miembros', color: 'from-purple-500 to-pink-500' },
              { icon: MapPin, value: '100+', label: 'Capítulos', color: 'from-yellow-400 to-amber-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 mb-3`}>
                  <stat.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
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
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
    </section>
  );
}
