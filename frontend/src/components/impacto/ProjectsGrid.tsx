/**
 * ProjectsGrid Component
 * Grid de proyectos destacados con filtros por tipo y estado
 * Carga dinámica desde backend /featured-projects
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, HeartPulse, Home, Users, Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

type ProjectType = 'salud' | 'educacion' | 'comunitario' | 'acompanamiento';
type ProjectStatus = 'En curso' | 'Finalizado' | 'Próximo';

interface Project {
  id: string;
  nombre: string;
  tipo: ProjectType;
  descripcion: string;
  estado: ProjectStatus;
  imagenUrl?: string;
  ubicacion?: string;
  beneficiarios: number;
  tags?: string[];
}

const typeConfig = {
  salud: {
    label: 'Salud',
    icon: HeartPulse,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
  },
  educacion: {
    label: 'Educación',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
  comunitario: {
    label: 'Apoyo Comunitario',
    icon: Home,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
  },
  acompanamiento: {
    label: 'Acompañamiento',
    icon: Users,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
};

const statusConfig = {
  'En curso': {
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
  },
  'Finalizado': {
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30',
  },
  'Próximo': {
    icon: Sparkles,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
  },
};

// Datos de prueba mientras la infraestructura de Azure no está disponible
const mockProjects: Project[] = [
  {
    id: '1',
    nombre: 'Jornada de Salud Rural',
    tipo: 'salud',
    descripcion: 'Atención médica básica, exámenes y medicamentos para comunidades rurales del oriente antioqueño.',
    estado: 'Finalizado',
    ubicacion: 'Oriente Antioqueño',
    beneficiarios: 250,
    tags: ['rural', 'salud', 'antioquia'],
  },
  {
    id: '2',
    nombre: 'Útiles para Sonreír',
    tipo: 'educacion',
    descripcion: 'Entrega de kits escolares completos a niños de familias vulnerables en zona urbana y rural.',
    estado: 'En curso',
    ubicacion: 'Medellín y municipios',
    beneficiarios: 180,
    tags: ['educación', 'niños', 'kits'],
  },
  {
    id: '3',
    nombre: 'Hogares con Dignidad',
    tipo: 'comunitario',
    descripcion: 'Mejoramiento de viviendas en sectores vulnerables: techos, pisos, pintura y reparaciones básicas.',
    estado: 'En curso',
    ubicacion: 'Comuna 13, Medellín',
    beneficiarios: 45,
    tags: ['vivienda', 'construcción', 'mejoramiento'],
  },
  {
    id: '4',
    nombre: 'Acompañamiento Emocional',
    tipo: 'acompanamiento',
    descripcion: 'Apoyo psicológico y emocional a familias afectadas por situaciones de crisis y duelo.',
    estado: 'En curso',
    ubicacion: 'Medellín',
    beneficiarios: 75,
    tags: ['psicología', 'apoyo', 'familia'],
  },
  {
    id: '5',
    nombre: 'Mercados Solidarios',
    tipo: 'comunitario',
    descripcion: 'Entrega de mercados completos a familias identificadas por líderes comunitarios.',
    estado: 'Finalizado',
    ubicacion: 'Valle de Aburrá',
    beneficiarios: 320,
    tags: ['alimentos', 'emergencia', 'solidaridad'],
  },
  {
    id: '6',
    nombre: 'Biblioteca Móvil',
    tipo: 'educacion',
    descripcion: 'Llevar libros y cultura a zonas donde no hay acceso a bibliotecas públicas.',
    estado: 'Próximo',
    ubicacion: 'Oriente Antioqueño',
    beneficiarios: 150,
    tags: ['cultura', 'lectura', 'móvil'],
  },
];

export default function ProjectsGrid() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/featured-projects');
      setProjects(data);
    } catch (error) {
      console.warn('Backend no disponible, usando datos de demostración:', error);
      // Fallback a datos de prueba si el backend no está disponible
      setTimeout(() => {
        setProjects(mockProjects);
        setLoading(false);
      }, 500);
      return;
    }
    setProjects([]);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-gray-400 text-lg">Cargando proyectos...</div>
        </div>
      </section>
    );
  }

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
            Proyectos <span className="text-yellow-400">Destacados</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Iniciativas que transforman vidas y fortalecen comunidades
          </p>
        </motion.div>

        {projects.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">No hay proyectos destacados en este momento.</p>
            <p className="text-sm mt-2">Los administradores pueden agregar proyectos desde el panel de gestión.</p>
          </div>
        ) : (
          <>
            {/* Grid de proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => {
                const typeInfo = typeConfig[project.tipo as ProjectType] || typeConfig.comunitario;
                const statusInfo = statusConfig[project.estado as ProjectStatus] || statusConfig['En curso'];
                const TypeIcon = typeInfo.icon;
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -8 }}
                    className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden"
                  >
                    {/* Borde brillante en hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(255,210,0,0.2)]" />
                    </div>

                    <div className="relative p-6 flex flex-col h-full">
                      {/* Header con tipo y estado */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Tag de tipo */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
                          <TypeIcon className={`w-4 h-4 ${typeInfo.textColor}`} />
                          <span className={`text-xs font-semibold ${typeInfo.textColor}`}>
                            {typeInfo.label}
                          </span>
                        </div>

                        {/* Tag de estado */}
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {project.estado}
                          </span>
                        </div>
                      </div>

                      {/* Título */}
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                        {project.nombre}
                      </h3>

                      {/* Descripción */}
                      <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                        {project.descripcion}
                      </p>

                      {/* Info adicional */}
                      {(project.ubicacion || project.beneficiarios > 0) && (
                        <div className="mt-4 space-y-1">
                          {project.ubicacion && (
                            <div className="text-xs text-gray-500">
                              📍 {project.ubicacion}
                            </div>
                          )}
                          {project.beneficiarios > 0 && (
                            <div className="text-xs text-gray-500">
                              👥 {project.beneficiarios.toLocaleString()} beneficiarios
                            </div>
                          )}
                        </div>
                      )}

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
          </>
        )}
      </div>
    </section>
  );
}
