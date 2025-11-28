import { motion } from 'framer-motion';

/**
 * Hero de la página Historia
 * Estilo cinematográfico con efecto glow y degradado oscuro
 */
export default function HeroHistory() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-secondary to-black">
      {/* Background Pattern - Carretera */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_48%,#FFD200_49%,#FFD200_51%,transparent_52%,transparent_100%)] bg-[length:100%_100px]"></div>
      </div>

      {/* Content */}
      <div className="container-adventure relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-primary text-6xl md:text-8xl mb-4">🏍️</div>
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-black text-white mb-6 text-glow-adventure leading-tight">
            Una tradición de <span className="text-primary">47 años</span><br />
            construyendo hermandad<br />
            en dos ruedas
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Desde las calles de <span className="text-white font-semibold">Chicago</span> hasta las montañas de{' '}
            <span className="text-primary font-semibold">Medellín</span>: el viaje de una organización que transformó 
            el mototurismo en movimiento social.
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="h-1 w-48 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-12"
          ></motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}
