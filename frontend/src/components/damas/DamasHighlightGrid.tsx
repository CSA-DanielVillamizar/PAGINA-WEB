/**
 * DamasHighlightGrid Component
 * Grid de Damas destacadas con logros y reconocimientos
 * Cards con información de lideresas, campeonas y fundadoras
 */

import { motion } from 'framer-motion';
import { MapPin, Trophy, Award, Star, Crown, Heart, Target, Zap } from 'lucide-react';

type DamaTag = 'Líder' | 'Campeona' | 'Fundadora' | 'Embajadora' | 'Pionera';

interface Dama {
  id: string;
  name: string;
  chapter: string;
  achievement: string;
  tag: DamaTag;
  country: string;
  yearsActive: string;
  avatar?: string;
}

const damas: Dama[] = [
  {
    id: '1',
    name: 'Rosa María Fernández',
    chapter: 'L.A.M.A. Medellín',
    achievement: 'Fundadora del capítulo Medellín. Más de 50,000 km registrados en rutas nacionales e internacionales.',
    tag: 'Fundadora',
    country: 'Colombia',
    yearsActive: '15 años',
  },
  {
    id: '2',
    name: 'Patricia "Paty" Morales',
    chapter: 'L.A.M.A. Miami',
    achievement: 'Campeona regional Rally de las Américas 2023. Lideresa de proyectos sociales transfronterizos.',
    tag: 'Campeona',
    country: 'USA',
    yearsActive: '12 años',
  },
  {
    id: '3',
    name: 'Carmen Torres',
    chapter: 'L.A.M.A. San Juan',
    achievement: 'Coordinadora de eventos internacionales. Embajadora de la hermandad en el Caribe.',
    tag: 'Embajadora',
    country: 'Puerto Rico',
    yearsActive: '18 años',
  },
  {
    id: '4',
    name: 'Gabriela "Gaby" Suárez',
    chapter: 'L.A.M.A. México',
    achievement: 'Primera mujer en completar la Ruta Panamericana con L.A.M.A. Pionera en mototurismo extremo.',
    tag: 'Pionera',
    country: 'México',
    yearsActive: '20 años',
  },
  {
    id: '5',
    name: 'Lucía Ramos',
    chapter: 'L.A.M.A. Buenos Aires',
    achievement: 'Líder continental de desarrollo comunitario. Organizadora de jornadas sociales en Sudamérica.',
    tag: 'Líder',
    country: 'Argentina',
    yearsActive: '10 años',
  },
  {
    id: '6',
    name: 'Isabella Costa',
    chapter: 'L.A.M.A. São Paulo',
    achievement: 'Campeona nacional de resistencia. Récord de 72 horas continuas en ruta solidaria.',
    tag: 'Campeona',
    country: 'Brasil',
    yearsActive: '8 años',
  },
];

const tagConfig = {
  'Líder': {
    icon: Star,
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
  },
  'Campeona': {
    icon: Trophy,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
  'Fundadora': {
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    textColor: 'text-yellow-400',
  },
  'Embajadora': {
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-400',
  },
  'Pionera': {
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
  },
};

export default function DamasHighlightGrid() {
  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Damas <span className="text-yellow-400">Destacadas</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Lideresas que marcan el camino y son referente en la hermandad mundial
          </p>
        </motion.div>

        {/* Grid de Damas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {damas.map((dama, index) => {
            const tagInfo = tagConfig[dama.tag];
            const TagIcon = tagInfo.icon;

            return (
              <motion.div
                key={dama.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl overflow-hidden"
              >
                {/* Borde brillante en hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-3xl shadow-[0_0_40px_rgba(255,210,0,0.3)]" />
                </div>

                <div className="relative p-8">
                  {/* Avatar con gradiente */}
                  <div className="mb-6 relative">
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${tagInfo.color} p-1`}>
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${tagInfo.color} flex items-center justify-center`}>
                          <span className="text-3xl font-bold text-white">
                            {dama.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tag flotante */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tagInfo.bgColor} border ${tagInfo.borderColor}`}>
                        <TagIcon className={`w-3.5 h-3.5 ${tagInfo.textColor}`} />
                        <span className={`text-xs font-bold ${tagInfo.textColor}`}>
                          {dama.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nombre */}
                  <h3 className="text-2xl font-bold text-white text-center mb-2 group-hover:text-yellow-400 transition-colors">
                    {dama.name}
                  </h3>

                  {/* Capítulo */}
                  <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm font-semibold mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{dama.chapter}</span>
                  </div>

                  {/* Logro */}
                  <p className="text-gray-400 text-sm leading-relaxed text-center mb-6">
                    {dama.achievement}
                  </p>

                  {/* Footer con info adicional */}
                  <div className="pt-6 border-t border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Target className="w-3.5 h-3.5" />
                      <span>{dama.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Award className="w-3.5 h-3.5" />
                      <span>{dama.yearsActive}</span>
                    </div>
                  </div>
                </div>

                {/* Glow effect en hover */}
                <div className={`absolute inset-0 bg-gradient-to-t ${tagInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
              </motion.div>
            );
          })}
        </div>

        {/* Nota informativa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm max-w-3xl mx-auto leading-relaxed">
            <span className="text-yellow-400 font-semibold">Nota:</span> Esta es una muestra representativa. 
            Cientos de Damas de L.A.M.A. en todo el mundo contribuyen diariamente al crecimiento 
            de la hermandad con su liderazgo, ejemplo y compromiso.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
