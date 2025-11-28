import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Timeline interactivo con estilo carretera
 * Animaciones "reveal on scroll" con efecto spark amarillo
 */

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: string;
}

const events: TimelineEvent[] = [
  {
    year: '1977',
    title: 'Fundación de L.A.M.A. en Chicago',
    description: 'Mario Nieves funda Latin American Motorcycle Association en Chicago, Illinois, uniendo hermandad latina y pasión motociclista.',
    icon: '🏁',
  },
  {
    year: '1980-1995',
    title: 'Expansión Nacional (EE.UU.)',
    description: 'L.A.M.A. se expande a múltiples estados: Nueva York, California, Florida, Texas. Consolidación de capítulos y eventos nacionales.',
    icon: '🗺️',
  },
  {
    year: '1999-2000',
    title: 'Globalización: Creación de I.M.A.',
    description: 'Nace International Motorcycles Association (I.M.A.) para coordinar capítulos fuera de EE.UU. Expansión a Latinoamérica.',
    icon: '🌎',
  },
  {
    year: '2006',
    title: 'Nacimiento del Mototurismo Extremo',
    description: 'L.A.M.A. evoluciona su filosofía: de rodadas urbanas a aventuras extremas en montaña, desierto y selva. Turismo con propósito.',
    icon: '⛰️',
  },
  {
    year: '2010-2020',
    title: 'L.A.M.A. llega a Colombia',
    description: 'Primeros capítulos colombianos se afilian a I.M.A. Crecimiento en ciudades como Bogotá, Cali, Barranquilla.',
    icon: '🇨🇴',
  },
  {
    year: '2013',
    title: 'Fundación del Capítulo Medellín',
    description: 'Nace el Capítulo L.A.M.A. Medellín con visión de mototurismo cultural y responsabilidad social en Antioquia.',
    icon: '🏍️',
  },
  {
    year: '2025',
    title: 'Evolución a Fundación L.A.M.A. Medellín',
    description: 'Hito histórico: primer capítulo en Colombia que se constituye legalmente como Fundación sin ánimo de lucro con propósito social.',
    icon: '⭐',
  },
];

export default function Timeline() {
  return (
    <section className="py-24 bg-gradient-to-b from-black via-secondary to-black relative overflow-hidden">
      {/* Carretera vertical (línea amarilla) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent transform -translate-x-1/2 hidden md:block"></div>

      <div className="container-adventure relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            La Ruta en el <span className="text-primary text-glow-adventure">Tiempo</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Recorre los hitos que forjaron nuestra historia desde 1977 hasta hoy
          </p>
        </motion.div>

        {/* Timeline Events */}
        <div className="space-y-12 md:space-y-24">
          {events.map((event, index) => (
            <TimelineCard key={event.year} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`flex flex-col md:flex-row items-center gap-8 ${
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Content Card */}
      <div className="flex-1 w-full">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card-adventure bg-gradient-to-br from-secondary to-black border-l-4 border-primary hover:border-primary/80 transition-adventure"
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0">{event.icon}</div>
            <div className="flex-1">
              <div className="text-primary font-black text-3xl mb-2">{event.year}</div>
              <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
              <p className="text-gray-400 leading-relaxed">{event.description}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Center Icon (Spark Effect) */}
      <div className="relative flex-shrink-0 hidden md:block">
        <motion.div
          animate={isInView ? {
            scale: [1, 1.2, 1],
            boxShadow: [
              '0 0 0 0 rgba(255, 210, 0, 0)',
              '0 0 20px 10px rgba(255, 210, 0, 0.4)',
              '0 0 0 0 rgba(255, 210, 0, 0)',
            ],
          } : {}}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black text-2xl font-bold shadow-lg"
        >
          🏍️
        </motion.div>
      </div>

      {/* Spacer for alignment */}
      <div className="flex-1 hidden md:block"></div>
    </motion.div>
  );
}
