/**
 * WorldMapSection Component
 * Visualización simplificada de la presencia global de L.A.M.A.
 * Mapa estilizado con puntos brillantes por región
 */

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  position: { top: string; left: string };
  chapters: number;
  color: string;
}

const regions: Region[] = [
  {
    id: 'north-america',
    name: 'América del Norte',
    position: { top: '25%', left: '20%' },
    chapters: 35,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'latin-america',
    name: 'América Latina',
    position: { top: '55%', left: '25%' },
    chapters: 42,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'europe',
    name: 'Europa',
    position: { top: '20%', left: '50%' },
    chapters: 18,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'asia',
    name: 'Asia',
    position: { top: '35%', left: '75%' },
    chapters: 8,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'africa',
    name: 'África',
    position: { top: '50%', left: '52%' },
    chapters: 3,
    color: 'from-yellow-500 to-amber-500',
  },
];

export default function WorldMapSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Encabezado */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Presencia <span className="text-yellow-400">Global</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            L.A.M.A. está presente en todos los continentes, uniendo motociclistas 
            bajo los valores de hermandad, respeto y servicio
          </p>
        </motion.div>
      </div>

      {/* Mapa interactivo simplificado */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 md:p-12 overflow-hidden"
          style={{ minHeight: '500px' }}
        >
          {/* Fondo de mapa estilizado */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('/world-map.svg')] bg-cover bg-center" />
          </div>

          {/* Grid de fondo */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(to right, #FFD200 1px, transparent 1px), linear-gradient(to bottom, #FFD200 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Puntos de regiones */}
          <div className="relative w-full h-full">
            {regions.map((region, index) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="absolute group cursor-pointer"
                style={{ top: region.position.top, left: region.position.left }}
              >
                {/* Pulso animado */}
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute -inset-4 rounded-full bg-gradient-to-r ${region.color} opacity-30`}
                />

                {/* Punto central */}
                <div className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center shadow-[0_0_30px_rgba(255,210,0,0.5)] group-hover:scale-125 transition-transform duration-300`}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>

                {/* Tooltip con información */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black/90 backdrop-blur-sm border border-yellow-400/30 rounded-xl px-4 py-3 whitespace-nowrap shadow-[0_0_30px_rgba(255,210,0,0.3)]">
                    <div className="text-white font-bold text-sm mb-1">
                      {region.name}
                    </div>
                    <div className="text-yellow-400 text-xs font-semibold">
                      {region.chapters} Capítulos
                    </div>
                  </div>
                  {/* Flecha del tooltip */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-yellow-400/30" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Líneas de conexión decorativas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <motion.line
              x1="20%" y1="25%" x2="25%" y2="55%"
              stroke="#FFD200"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <motion.line
              x1="25%" y1="55%" x2="52%" y2="50%"
              stroke="#FFD200"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.7 }}
            />
            <motion.line
              x1="50%" y1="20%" x2="75%" y2="35%"
              stroke="#FFD200"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.9 }}
            />
          </svg>

          {/* Glow decorativo */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-yellow-400/10 to-transparent rounded-tl-full" />
        </motion.div>
      </div>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="max-w-7xl mx-auto px-6 mt-8 text-center"
      >
        <p className="text-gray-500 text-sm">
          <span className="text-yellow-400 font-semibold">Nota:</span> Pasa el cursor sobre cada región para ver más detalles. 
          Los números son aproximados y reflejan capítulos activos registrados.
        </p>
      </motion.div>
    </section>
  );
}
