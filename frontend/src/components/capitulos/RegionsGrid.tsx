/**
 * RegionsGrid Component
 * Grid organizado por regiones mostrando capítulos de L.A.M.A.
 * Acordeones expansibles con listado de países y capítulos
 * ACTUALIZADO con datos oficiales de América Latina
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Flag } from 'lucide-react';

interface Chapter {
  country: string;
  name: string;
  city?: string;
}

interface Region {
  id: string;
  name: string;
  emoji: string;
  color: string;
  chapters: Chapter[];
}

const regions: Region[] = [
  {
    id: 'latin-america',
    name: 'América Latina',
    emoji: '🌎',
    color: 'from-green-500 to-emerald-500',
    chapters: [
      // ARGENTINA
      { country: 'Argentina', name: 'L.A.M.A. ACONCAGUA' },
      { country: 'Argentina', name: 'L.A.M.A. BUENOS AIRES' },
      { country: 'Argentina', name: 'L.A.M.A. MAR DEL PLATA' },
      { country: 'Argentina', name: 'L.A.M.A. MENDOZA' },
      { country: 'Argentina', name: 'L.A.M.A. RIO GALLEGOS' },
      
      // BOLIVIA
      { country: 'Bolivia', name: 'L.A.M.A. COCHABAMBA' },
      { country: 'Bolivia', name: 'L.A.M.A. SANTA CRUZ DE LA SIERRA' },
      { country: 'Bolivia', name: 'L.A.M.A. URUBO' },
      
      // BRASIL
      { country: 'Brasil', name: 'L.A.M.A. ANAPOLIS' },
      { country: 'Brasil', name: 'L.A.M.A. APARECIDA' },
      { country: 'Brasil', name: 'L.A.M.A. GOIANIA' },
      { country: 'Brasil', name: 'L.A.M.A. RIO DE JANEIRO' },
      
      // CHILE
      { country: 'Chile', name: 'L.A.M.A. ANTOFAGASTA' },
      { country: 'Chile', name: '(CHI) RANCAGUA' },
      { country: 'Chile', name: 'L.A.M.A. VALPARAISO' },
      { country: 'Chile', name: 'L.A.M.A. VIÑA DEL MAR' },
      
      // COLOMBIA
      { country: 'Colombia', name: 'L.A.M.A. ARMENIA' },
      { country: 'Colombia', name: 'L.A.M.A. BARRANQUILLA' },
      { country: 'Colombia', name: 'L.A.M.A. BOGOTA' },
      { country: 'Colombia', name: 'L.A.M.A. BUCARAMANGA' },
      { country: 'Colombia', name: 'L.A.M.A. CALI' },
      { country: 'Colombia', name: 'L.A.M.A. CARTAGENA' },
      { country: 'Colombia', name: 'L.A.M.A. CUCUTA' },
      { country: 'Colombia', name: 'L.A.M.A. DUITAMA' },
      { country: 'Colombia', name: 'L.A.M.A. FLORIDABLANCA' },
      { country: 'Colombia', name: 'L.A.M.A. MANIZALES' },
      { country: 'Colombia', name: 'L.A.M.A. MEDELLIN' },
      { country: 'Colombia', name: 'L.A.M.A. NEIVA' },
      { country: 'Colombia', name: 'L.A.M.A. IBAGUE' },
      { country: 'Colombia', name: 'L.A.M.A. PASTO' },
      { country: 'Colombia', name: 'L.A.M.A. PEREIRA' },
      { country: 'Colombia', name: 'L.A.M.A. POPAYAN' },
      { country: 'Colombia', name: 'L.A.M.A. PTO. COLOMBIA' },
      { country: 'Colombia', name: 'L.A.M.A. SABANA' },
      { country: 'Colombia', name: 'L.A.M.A. VALLE DE ABURRA' },
      
      // ECUADOR
      { country: 'Ecuador', name: 'L.A.M.A. BABAHOYO' },
      { country: 'Ecuador', name: 'L.A.M.A. CUENCA' },
      { country: 'Ecuador', name: 'L.A.M.A. GUAYAQUIL' },
      { country: 'Ecuador', name: 'L.A.M.A. LAGOAGRIO' },
      { country: 'Ecuador', name: 'L.A.M.A. MANTA' },
      { country: 'Ecuador', name: 'L.A.M.A. OTAVALO' },
      { country: 'Ecuador', name: 'L.A.M.A. PORTOVIEJO' },
      { country: 'Ecuador', name: '(ECU) QUITO' },
      { country: 'Ecuador', name: 'L.A.M.A. RIOBAMBA' },
      { country: 'Ecuador', name: 'L.A.M.A. VALLES' },
      
      // PERU
      { country: 'Perú', name: 'L.A.M.A. AREQUIPA' },
      { country: 'Perú', name: 'L.A.M.A. LIMA' },
      
      // URUGUAY
      { country: 'Uruguay', name: 'L.A.M.A. CUPE' },
      { country: 'Uruguay', name: 'L.A.M.A. LAS PIEDRAS' },
      { country: 'Uruguay', name: 'L.A.M.A. MONTEVIDEO' },
      { country: 'Uruguay', name: 'L.A.M.A. RIVERA' },
      
      // VENEZUELA
      { country: 'Venezuela', name: 'L.A.M.A. BARQUISIMETO' },
      { country: 'Venezuela', name: 'L.A.M.A. CARACAS' },
      { country: 'Venezuela', name: 'L.A.M.A. MATURIN' },
      { country: 'Venezuela', name: 'L.A.M.A. MERIDA' },
      { country: 'Venezuela', name: 'L.A.M.A. SAN CRISTOBAL' },
      { country: 'Venezuela', name: 'L.A.M.A. TUCUPITA' },
      { country: 'Venezuela', name: 'L.A.M.A. VALENCIA' },
    ],
  },
];

export default function RegionsGrid() {
  const [expandedRegion, setExpandedRegion] = useState<string | null>('latin-america'); // Expandido por defecto

  const toggleRegion = (regionId: string) => {
    setExpandedRegion(expandedRegion === regionId ? null : regionId);
  };

  // Agrupar capítulos por país
  const groupByCountry = (chapters: Chapter[]) => {
    const grouped: Record<string, Chapter[]> = {};
    chapters.forEach(chapter => {
      if (!grouped[chapter.country]) {
        grouped[chapter.country] = [];
      }
      grouped[chapter.country].push(chapter);
    });
    return grouped;
  };

  return (
    <section id="regions-section" className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Capítulos en <span className="text-yellow-400">América Latina</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Descubre la red de hermandad L.A.M.A. distribuida en 11 países de Latinoamérica
          </p>
        </motion.div>

        {/* Acordeones de regiones */}
        <div className="space-y-4">
          {regions.map((region, index) => {
            const isExpanded = expandedRegion === region.id;
            const groupedChapters = groupByCountry(region.chapters);
            const countries = Object.keys(groupedChapters).sort();

            return (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group"
              >
                {/* Header del acordeón */}
                <button
                  onClick={() => toggleRegion(region.id)}
                  className="w-full bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-yellow-400/50 rounded-2xl p-6 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Emoji */}
                      <div className="text-4xl">
                        {region.emoji}
                      </div>

                      {/* Nombre y stats */}
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                          {region.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {region.chapters.length} capítulos en {countries.length} países
                        </p>
                      </div>
                    </div>

                    {/* Icono de expand */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                    </motion.div>
                  </div>
                </button>

                {/* Contenido expandible */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-2xl p-6">
                        {/* Agrupado por país */}
                        <div className="space-y-6">
                          {countries.map((country, countryIndex) => (
                            <motion.div
                              key={country}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: countryIndex * 0.05, duration: 0.3 }}
                              className="space-y-3"
                            >
                              {/* Encabezado del país */}
                              <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                                <Flag className="w-4 h-4 text-yellow-400" />
                                <h4 className="text-lg font-bold text-white">
                                  {country}
                                </h4>
                                <span className="ml-auto text-xs text-gray-500 font-semibold">
                                  {groupedChapters[country].length} {groupedChapters[country].length === 1 ? 'capítulo' : 'capítulos'}
                                </span>
                              </div>

                              {/* Lista de capítulos del país */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {groupedChapters[country].map((chapter, chapterIndex) => (
                                  <motion.div
                                    key={chapterIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: chapterIndex * 0.03, duration: 0.3 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-black/30 hover:bg-black/50 border border-gray-800/50 hover:border-yellow-400/30 transition-all duration-300 group/chapter"
                                  >
                                    {/* Icono */}
                                    <div className="flex-shrink-0">
                                      <div className={`p-2 rounded-lg bg-gradient-to-br ${region.color} bg-opacity-10`}>
                                        <MapPin className="w-4 h-4 text-yellow-400" />
                                      </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow min-w-0">
                                      <div className="font-semibold text-white text-sm group-hover/chapter:text-yellow-400 transition-colors truncate">
                                        {chapter.name}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Nota final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm max-w-3xl mx-auto leading-relaxed">
            <span className="text-yellow-400 font-semibold">Nota:</span> Todos los capítulos listados 
            son parte oficial de la red L.A.M.A. y mantienen activamente los valores de hermandad, 
            respeto y pasión por el mototurismo responsable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
