/**
 * ProjectsGrid Component
 * Grid de proyectos destacados con filtros por tipo y estado
 * Muestra las iniciativas sociales de la fundación
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, HeartPulse, Home, Users, Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

type ProjectType = 'salud' | 'educacion' | 'comunitario' | 'acompanamiento';
type ProjectStatus = 'En curso' | 'Finalizado' | 'Próximo';

interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  status: ProjectStatus;
  image?: string;
}

const projects: Project[] = [
  {
    id: '1',
    name: 'Jornada de Salud Rural',
    type: 'salud',
    description: 'Atención médica básica, exámenes y medicamentos para comunidades rurales del oriente antioqueño.',
    status: 'Finalizado',
  },
  {
    id: '2',
    name: 'Útiles para Sonreír',
    type: 'educacion',
    description: 'Entrega de kits escolares completos a niños de familias vulnerables en zona urbana y rural.',
    status: 'En curso',
  },
  {
    id: '3',
    name: 'Hogares con Dignidad',
    type: 'comunitario',
    description: 'Mejoramiento de viviendas en sectores vulnerables: techos, pisos, pintura y reparaciones básicas.',
    status: 'En curso',
  },
  {
    id: '4',
    name: 'Acompañamiento Emocional',
    type: 'acompanamiento',
    description: 'Apoyo psicológico y emocional a familias afectadas por situaciones de crisis y duelo.',
    status: 'En curso',
  },
  {
    id: '5',
    name: 'Red de Alimentación Solidaria',
    type: 'comunitario',
    description: 'Distribución semanal de mercados y almuerzos comunitarios en barrios periféricos.',
    status: 'En curso',
  },
  {
    id: '6',
    name: 'Formación en Oficios',
    type: 'educacion',
    description: 'Talleres técnicos gratuitos: mecánica, soldadura, costura y panadería para jóvenes sin empleo.',
    status: 'Próximo',
  },
];

// Configuración de tipos de proyecto
const typeConfig: Record<ProjectType, { icon: React.ElementType; color: string; label: string }> = {
  salud: {
    icon: HeartPulse,
    color: 'from-red-500 to-pink-500',
    label: 'Salud',
  },
  educacion: {
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    label: 'Educación',
  },
  comunitario: {
    icon: Home,
    color: 'from-green-500 to-emerald-500',
    label: 'Comunitario',
  },
  acompanamiento: {
    icon: Users,
    color: 'from-purple-500 to-violet-500',
    label: 'Acompañamiento',
  },
};

// Configuración de estados de proyecto
const statusConfig: Record<ProjectStatus, { icon: React.ElementType; color: string }> = {
  'En curso': {
    icon: Clock,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  Finalizado: {
    icon: CheckCircle2,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  Próximo: {
    icon: Sparkles,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
};

export default function ProjectsGrid() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Proyectos <span className="text-yellow-400">Destacados</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Cada kilómetro recorrido se traduce en una oportunidad de cambiar vidas. 
            Conoce nuestras iniciativas sociales más relevantes y su impacto en la comunidad.
          </p>
        </motion.div>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const TypeIcon = typeConfig[project.type].icon;
            const StatusIcon = statusConfig[project.status].icon;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,210,0,0.3)] overflow-hidden flex flex-col"
              >
                {/* Tag de tipo */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${typeConfig[project.type].color} bg-opacity-10 border border-gray-700`}>
                    <TypeIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      {typeConfig[project.type].label}
                    </span>
                  </div>

                  {/* Badge de estado */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusConfig[project.status].color} text-xs font-medium`}>
                    <StatusIcon className="w-3 h-3" />
                    {project.status}
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-grow flex flex-col">
                  {/* Título */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors leading-tight">
                    {project.name}
                  </h3>

                  {/* Descripción */}
                  <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                    {project.description}
                  </p>

                  {/* Footer decorativo */}
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                        L.A.M.A. Medellín
                      </span>
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Glow effect en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/0 via-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-12"
        >
          <button 
            onClick={() => navigate('/donations')}
            className="group relative px-8 py-4 bg-yellow-400 text-black font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,210,0,0.5)]"
          >
            <span className="relative z-10">Ver Todos los Proyectos</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
