import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Calendar, Globe, MapPin, Users, Award } from 'lucide-react';

/**
 * Sección de métricas del legado con contadores animados
 * Cards con efecto glow-neón al hover
 */

interface Stat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  color: string;
}

const stats: Stat[] = [
  {
    label: 'Años de Tradición',
    value: 47,
    suffix: ' años',
    icon: <Calendar size={40} />,
    color: 'primary',
  },
  {
    label: 'Presencia Global',
    value: 25,
    suffix: '+ naciones',
    icon: <Globe size={40} />,
    color: 'primary',
  },
  {
    label: 'Compromiso Medellín',
    value: 12,
    suffix: '+ años',
    icon: <MapPin size={40} />,
    color: 'primary',
  },
  {
    label: 'Fuerza Activa',
    value: 30,
    suffix: '+ miembros',
    icon: <Users size={40} />,
    color: 'primary',
  },
  {
    label: 'Continentes',
    value: 5,
    suffix: ' continentes',
    icon: <Award size={40} />,
    color: 'primary',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary to-black">
      <div className="container-adventure">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            El <span className="text-primary text-glow-adventure">Legado</span> en Números
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Casi medio siglo construyendo hermandad motociclista a nivel global
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        {/* Women Riders Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 card-adventure bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary text-center"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
            <div className="text-6xl">👩‍🦰🏍️</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Damas de L.A.M.A. Medellín
              </h3>
              <p className="text-gray-300 leading-relaxed max-w-2xl">
                Reconocemos y celebramos el creciente rol de las mujeres motociclistas en nuestra comunidad. 
                Las <span className="text-primary font-semibold">Damas de L.A.M.A.</span> son parte esencial de nuestra identidad, 
                liderando rodadas y proyectos sociales con la misma pasión y compromiso.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = stat.value;
    const duration = 2000; // 2 segundos
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 210, 0, 0.3)' }}
      className="card-adventure bg-gradient-to-br from-secondary to-black border-2 border-primary/30 hover:border-primary transition-adventure text-center group"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="text-primary group-hover:text-yellow-300 transition-colors">
          {stat.icon}
        </div>

        {/* Counter */}
        <div>
          <div className="text-4xl md:text-5xl font-black text-white mb-2">
            <span className="text-primary text-glow-adventure">{count}</span>
            <span className="text-2xl text-gray-400">{stat.suffix}</span>
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
            {stat.label}
          </div>
        </div>

        {/* Decorative line */}
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:via-yellow-300 transition-colors"></div>
      </div>
    </motion.div>
  );
}
