/**
 * MedellinContext Component
 * Bloque que posiciona a Medellín en el contexto global de L.A.M.A.
 * Destaca el rol del capítulo local en la hermandad internacional
 */

import { motion } from 'framer-motion';
import { Award, Heart, Globe, Zap } from 'lucide-react';

export default function MedellinContext() {
  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Efectos decorativos */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-400/30 rounded-3xl p-8 md:p-12 overflow-hidden"
        >
          {/* Patrón de fondo */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, #FFD200 2px, transparent 2px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Contenido */}
          <div className="relative z-10">
            {/* Tag superior */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 via-yellow-400/10 to-red-500/10 border border-yellow-400/30 text-yellow-400 text-sm font-semibold">
                <Globe className="w-4 h-4" />
                Medellín en el Mundo
              </span>
            </motion.div>

            {/* Título */}
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Medellín: parte de una{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-green-500 to-yellow-400 bg-clip-text text-transparent">
                red mundial
              </span>
            </h2>

            {/* Texto principal */}
            <div className="space-y-4 text-gray-300 leading-relaxed text-lg mb-8">
              <p>
                <strong className="text-yellow-400">L.A.M.A. Medellín</strong> no es solo un capítulo local: 
                es parte de una <strong className="text-white">hermandad global</strong> con casi medio siglo de historia. 
                Nacida como capítulo en 2013 y transformada en{' '}
                <strong className="text-yellow-400">Fundación en 2025</strong>, representa a Colombia 
                ante una red de más de 100 capítulos en 5 continentes.
              </p>
              <p>
                Cada rodada, cada evento y cada proyecto social llevado a cabo en Medellín 
                resuena en la comunidad internacional de L.A.M.A., fortaleciendo los lazos 
                de <strong className="text-yellow-400">hermandad, respeto y servicio</strong> que 
                nos unen sin importar fronteras, idiomas o culturas.
              </p>
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Award, label: 'Fundación 2024', value: 'Colombia', color: 'from-yellow-500 to-amber-500' },
                { icon: Heart, label: 'Capítulo desde', value: '2013', color: 'from-green-500 to-emerald-500' },
                { icon: Globe, label: 'Red Global', value: '5 Continentes', color: 'from-blue-500 to-cyan-500' },
                { icon: Zap, label: 'Hermandad', value: '1977-2025', color: 'from-red-500 to-pink-500' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="group relative bg-black/50 border border-gray-800 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300"
                >
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 mb-3`}>
                    <stat.icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">
                    {stat.label}
                  </div>
                  <div className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {stat.value}
                  </div>

                  {/* Glow en hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(255,210,0,0.2)]" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quote final */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 p-6 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl"
            >
              <p className="text-center text-gray-300 italic">
                "Nuestro capítulo, hoy Fundación, representa a Colombia ante una hermandad 
                global con casi medio siglo de historia. Cada kilómetro rodado en Medellín 
                es un kilómetro que conecta a Colombia con el mundo."
              </p>
            </motion.div>
          </div>

          {/* Decoración de esquinas */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-tl-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-green-500/10 to-transparent rounded-br-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
