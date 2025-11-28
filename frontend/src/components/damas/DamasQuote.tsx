/**
 * DamasQuote Component
 * Cita institucional destacada sobre el rol de las Damas de L.A.M.A.
 * Mensaje inspiracional con diseño premium
 */

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function DamasQuote() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, #FFD200 1px, transparent 1px), linear-gradient(to bottom, #FFD200 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Glows decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          {/* Card principal */}
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-yellow-400/30 rounded-3xl p-12 md:p-16 overflow-hidden">
            {/* Quote icon decorativo grande */}
            <div className="absolute top-8 left-8 opacity-10">
              <Quote className="w-32 h-32 text-yellow-400" />
            </div>

            {/* Quote icon decorativo pequeño (abajo derecha) */}
            <div className="absolute bottom-8 right-8 opacity-10 rotate-180">
              <Quote className="w-20 h-20 text-pink-400" />
            </div>

            {/* Contenido */}
            <div className="relative z-10 text-center">
              {/* Tag superior */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-block mb-8"
              >
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 via-yellow-400/20 to-purple-500/20 border border-yellow-400/30 text-yellow-400 text-sm font-semibold">
                  Mensaje Institucional
                </span>
              </motion.div>

              {/* Cita principal */}
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8"
              >
                <span className="block mb-2">
                  "En L.A.M.A., las Damas
                </span>
                <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  no van atrás:
                </span>
                <span className="block mt-2">
                  lideran, inspiran y conquistan
                </span>
                <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent">
                  su propio camino."
                </span>
              </motion.blockquote>

              {/* Línea decorativa */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-8"
              />

              {/* Texto complementario */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
              >
                Desde 1977, las mujeres de L.A.M.A. han demostrado que el mototurismo 
                no tiene género. Son pilotas, líderes, maestras y embajadoras de una 
                hermandad que celebra la fuerza, el carácter y la pasión sobre dos ruedas.
              </motion.p>

              {/* Stats visuales pequeños */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.6 }}
                className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto"
              >
                {[
                  { value: '1977', label: 'Fundación' },
                  { value: '48 años', label: 'Historia' },
                  { value: '25+ países', label: 'Presencia' },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Efectos decorativos de borde */}
            <div className="absolute inset-0 rounded-3xl">
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-pink-400/20 to-transparent rounded-br-3xl" />
            </div>
          </div>

          {/* Glow externo */}
          <div className="absolute inset-0 rounded-3xl opacity-50">
            <div className="absolute inset-0 rounded-3xl shadow-[0_0_60px_rgba(255,210,0,0.2)]" />
          </div>
        </motion.div>

        {/* Texto adicional debajo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 text-sm">
            Las Damas de L.A.M.A. son parte integral de una hermandad global que trasciende fronteras, 
            culturas y generaciones. Cada una aporta su talento, experiencia y liderazgo 
            para construir un legado de respeto, igualdad y pasión motociclista.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
