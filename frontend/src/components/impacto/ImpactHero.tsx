/**
 * ImpactHero Component
 * Hero principal de la sección Impacto Social
 * Muestra el mensaje central "Kilómetros que se convierten en oportunidades"
 */

import { motion } from 'framer-motion';

export default function ImpactHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Fondo con imagen placeholder */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/placeholder-impact.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Impacto Social
            </span>
          </motion.div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block text-white">Kilómetros que se</span>
            <span className="block bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
              convierten en oportunidades
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Cada rodada, cada evento y cada peso donado se convierten en apoyo real 
            para personas y comunidades que lo necesitan.
          </p>

          {/* Línea decorativa */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-8"
          />
        </motion.div>
      </div>

      {/* Efecto de glow amarillo en la parte inferior */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
    </section>
  );
}
