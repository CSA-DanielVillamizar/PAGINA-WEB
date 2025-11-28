/**
 * StoriesCarousel Component
 * Carrusel de testimonios e historias de impacto
 * Muestra las voces de beneficiarios, voluntarios y aliados
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';

type StoryType = 'beneficiario' | 'voluntario' | 'aliado';

interface Story {
  id: string;
  name: string;
  role: string;
  type: StoryType;
  testimony: string;
  location: string;
  avatar?: string;
}

const stories: Story[] = [
  {
    id: '1',
    name: 'María González',
    role: 'Madre Beneficiaria',
    type: 'beneficiario',
    testimony: 'Gracias a la jornada de salud de L.A.M.A., mi hijo pudo recibir atención médica que no podíamos costear. Es un alivio saber que hay personas que se preocupan por los demás sin esperar nada a cambio.',
    location: 'San Rafael, Antioquia',
  },
  {
    id: '2',
    name: 'Carlos Ramírez',
    role: 'Voluntario',
    type: 'voluntario',
    testimony: 'Ser parte de L.A.M.A. me ha enseñado que rodar no es solo disfrutar la carretera, sino también devolver a la comunidad. Cada kilómetro tiene más sentido cuando sabes que estás construyendo algo mejor.',
    location: 'Medellín',
  },
  {
    id: '3',
    name: 'Fundación Esperanza',
    role: 'Aliado Estratégico',
    type: 'aliado',
    testimony: 'Trabajar con L.A.M.A. Medellín ha sido fundamental para ampliar nuestro alcance. Su compromiso, organización y capacidad de movilización son ejemplares. Juntos hemos logrado impactar cientos de familias.',
    location: 'Medellín',
  },
  {
    id: '4',
    name: 'Ana Lucía Pérez',
    role: 'Docente Beneficiaria',
    type: 'beneficiario',
    testimony: 'El proyecto de útiles escolares transformó el inicio de año de mis estudiantes. Ver sus caritas de felicidad al recibir sus kits no tiene precio. Gracias por creer en la educación.',
    location: 'El Carmen de Viboral',
  },
  {
    id: '5',
    name: 'Jorge Medina',
    role: 'Miembro Fundador',
    type: 'voluntario',
    testimony: 'Desde que fundamos este capítulo, hemos visto crecer no solo nuestra hermandad motociclista, sino también el impacto social. Cada evento es una oportunidad para servir, y eso nos llena de orgullo.',
    location: 'Medellín',
  },
];

const typeColors = {
  beneficiario: 'from-green-500 to-emerald-500',
  voluntario: 'from-yellow-500 to-amber-500',
  aliado: 'from-blue-500 to-cyan-500',
};

const typeLabels = {
  beneficiario: 'Beneficiario',
  voluntario: 'Voluntario',
  aliado: 'Aliado',
};

export default function StoriesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  const currentStory = stories[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Glow decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Historias de <span className="text-yellow-400">Impacto</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Las voces de quienes han sentido el impacto de nuestra labor
          </p>
        </motion.div>

        {/* Carrusel */}
        <div className="relative">
          {/* Card del testimonio */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStory.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 md:p-12">
                  {/* Quote icon */}
                  <div className="absolute top-8 left-8 opacity-10">
                    <Quote className="w-20 h-20 text-yellow-400" />
                  </div>

                  {/* Contenido */}
                  <div className="relative z-10">
                    {/* Tag de tipo */}
                    <div className="mb-6">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${typeColors[currentStory.type]} text-white`}>
                        {typeLabels[currentStory.type]}
                      </span>
                    </div>

                    {/* Testimonio */}
                    <blockquote className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 font-light italic">
                      "{currentStory.testimony}"
                    </blockquote>

                    {/* Información del autor */}
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-2 border-yellow-400/30">
                          <User className="w-8 h-8 text-black" />
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="text-white font-bold text-lg">
                          {currentStory.name}
                        </div>
                        <div className="text-yellow-400 text-sm font-medium">
                          {currentStory.role}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {currentStory.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decoración */}
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-yellow-400/5 to-transparent rounded-tl-full" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controles de navegación */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Botón Anterior */}
            <button
              onClick={handlePrevious}
              className="group p-3 rounded-full bg-gray-900 border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,210,0,0.3)]"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            </button>

            {/* Indicadores */}
            <div className="flex gap-2">
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-yellow-400'
                      : 'w-2 bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-label={`Ir a testimonio ${index + 1}`}
                />
              ))}
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={handleNext}
              className="group p-3 rounded-full bg-gray-900 border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,210,0,0.3)]"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>

          {/* Contador */}
          <div className="text-center mt-6 text-gray-500 text-sm font-medium">
            {currentIndex + 1} / {stories.length}
          </div>
        </div>
      </div>
    </section>
  );
}
