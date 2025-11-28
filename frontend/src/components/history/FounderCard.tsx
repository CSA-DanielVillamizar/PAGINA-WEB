import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Card destacada del fundador Mario Nieves
 * Layout foto izquierda + biografía derecha con cita motivadora
 */
export default function FounderCard() {
  const [photoSrc, setPhotoSrc] = useState('/MarioNieves.jpeg');
  return (
    <section className="py-20 bg-gradient-to-b from-black to-secondary">
      <div className="container-adventure">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            El Visionario: <span className="text-primary">Mario Nieves</span>
          </h2>
          <p className="text-xl text-gray-400">Fundador de L.A.M.A. (1977)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="card-adventure bg-gradient-to-br from-primary/5 to-transparent border-2 border-primary/30 hover:border-primary transition-adventure"
        >
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Foto/Avatar del Fundador */}
            <div className="md:col-span-2">
              <div className="relative group">
                <div className="aspect-square rounded-lg bg-black border-4 border-primary/60 overflow-hidden">
                  <img
                    src={photoSrc}
                    alt="Mario Nieves, Fundador de L.A.M.A."
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setPhotoSrc(prev => prev.endsWith('.jpeg') ? '/MarioNieves.jpg' : '/LogoMedellin.svg')}
                  />
                </div>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Biografía */}
            <div className="md:col-span-3 space-y-6">
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  En <span className="text-primary font-semibold">1977</span>, en las vibrantes calles de{' '}
                  <span className="text-white font-semibold">Chicago, Illinois</span>, Mario Nieves fundó la{' '}
                  <span className="text-white font-semibold">Latin American Motorcycle Association (L.A.M.A.)</span> con una visión clara: 
                  crear un espacio donde motociclistas latinos pudieran encontrar hermandad, respeto y propósito.
                </p>
                <p>
                  Nacido en <span className="text-white font-semibold">Puerto Rico</span>, Mario emigró a Estados Unidos buscando oportunidades. 
                  Su pasión por las motocicletas lo llevó a formar un grupo que trascendiera las fronteras culturales y geográficas, 
                  estableciendo valores de <span className="text-primary font-semibold">respeto, solidaridad y aventura</span>.
                </p>
                <p>
                  Lo que comenzó como un pequeño grupo de amigos en Chicago se ha convertido en una{' '}
                  <span className="text-white font-semibold">organización internacional presente en más de 25 países</span>, 
                  con miles de miembros que comparten su filosofía de vida.
                </p>
              </div>

              {/* Cita motivadora */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-black/50 border-l-4 border-primary rounded-r-lg p-6 mt-8"
              >
                <blockquote className="text-2xl md:text-3xl font-bold text-white italic leading-tight mb-4">
                  "Es más importante ser humanos que cualquier otra etiqueta."
                </blockquote>
                <p className="text-primary font-semibold text-right">— Mario Nieves, Fundador L.A.M.A.</p>
              </motion.div>

              {/* Legado */}
              <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-lg p-6 border-l-2 border-primary">
                <h4 className="text-xl font-bold text-white mb-3">Su Legado</h4>
                <p className="text-gray-300 leading-relaxed">
                  Hoy, casi <span className="text-primary font-semibold">50 años después</span>, el espíritu de Mario Nieves vive en cada rodada, 
                  en cada acción social y en cada miembro de L.A.M.A. alrededor del mundo. Su visión de hermandad sin fronteras 
                  sigue siendo el corazón de nuestra organización.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
