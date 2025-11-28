/**
 * ImpactStats Component
 * Métricas de impacto social con animación de contadores
 * Muestra estadísticas clave de las actividades de la fundación
 */

import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Users, Sparkles, Clock, Target, TrendingUp } from 'lucide-react';

interface Stat {
  id: string;
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const stats: Stat[] = [
  {
    id: 'familias',
    icon: Users,
    value: 450,
    suffix: '+',
    label: 'Familias Beneficiadas',
    color: 'text-yellow-400',
  },
  {
    id: 'jornadas',
    icon: Heart,
    value: 87,
    suffix: '',
    label: 'Jornadas Sociales',
    color: 'text-yellow-400',
  },
  {
    id: 'proyectos',
    icon: Target,
    value: 23,
    suffix: '',
    label: 'Proyectos Apoyados',
    color: 'text-yellow-400',
  },
  {
    id: 'voluntariado',
    icon: Clock,
    value: 2500,
    suffix: '+',
    label: 'Horas de Voluntariado',
    color: 'text-yellow-400',
  },
  {
    id: 'donaciones',
    icon: Sparkles,
    value: 150,
    suffix: 'M+',
    label: 'Donaciones Gestionadas',
    color: 'text-yellow-400',
  },
  {
    id: 'crecimiento',
    icon: TrendingUp,
    value: 85,
    suffix: '%',
    label: 'Crecimiento Anual',
    color: 'text-yellow-400',
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const duration = 2000; // 2 segundos

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function ImpactStats() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #FFD200 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nuestro <span className="text-yellow-400">Impacto</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Resultados tangibles que reflejan nuestro compromiso con la comunidad
          </p>
        </motion.div>

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 overflow-hidden"
            >
              {/* Glow effect en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:via-yellow-400/10 group-hover:to-yellow-400/5 transition-all duration-500" />

              {/* Contenido */}
              <div className="relative z-10">
                {/* Icono */}
                <div className="mb-4 inline-flex p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 group-hover:bg-yellow-400/20 group-hover:border-yellow-400/40 transition-all duration-300">
                  <stat.icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>

                {/* Valor */}
                <div className="text-5xl font-bold text-white mb-2 font-mono">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>

              {/* Borde brillante en hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_20px_rgba(255,210,0,0.3)]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Glow decorativo */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
    </section>
  );
}
