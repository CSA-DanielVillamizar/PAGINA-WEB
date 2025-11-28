import { motion } from 'framer-motion';
import { Users, Calendar, MapPin, Award, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Página Home - Landing page principal con diseño Adventure AAA
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-black scrollbar-adventure">
      {/* HERO SECTION - Cinematográfico */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fondo con gradiente y animación */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-0">
          <AdventureRoadAnimation />
        </div>

        {/* Partículas de luz */}
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Contenido Hero */}
        <div className="container-adventure relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 1 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center glow-adventure">
              <span className="text-primary font-bold text-6xl">L</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black text-white mb-4 text-glow-adventure"
          >
            VIVE LA AVENTURA.
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl md:text-3xl font-bold text-primary mb-4"
          >
            AYUDA A LA COMUNIDAD.
          </motion.p>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-12"
          >
            Mototurismo con propósito. Cultura que deja huella. Unidos por la aventura y el servicio a la comunidad.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/inscripcion" className="btn-adventure inline-flex items-center gap-2">
              Únete a L.A.M.A.
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-black transition-adventure"
            >
              Conócenos
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown size={32} className="text-primary" />
          </motion.div>
        </div>
      </section>

      {/* QUICK ACCESS SECTION */}
      <section className="py-20 bg-gradient-to-b from-black to-secondary">
        <div className="container-adventure">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white text-center mb-12"
          >
            Acceso Rápido
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickAccessCard
              title="Miembros"
              description="Conoce a nuestra comunidad"
              href="/members"
              icon={<Users size={32} />}
              gradient="from-primary/20 to-primary/5"
              delay={0}
            />
            <QuickAccessCard
              title="Eventos"
              description="Próximas aventuras"
              href="/moto-touring"
              icon={<Calendar size={32} />}
              gradient="from-blue-500/20 to-blue-500/5"
              delay={0.1}
            />
            <QuickAccessCard
              title="Noticias"
              description="Mantente informado"
              href="/news"
              icon={<MapPin size={32} />}
              gradient="from-green-500/20 to-green-500/5"
              delay={0.2}
            />
            <QuickAccessCard
              title="Souvenirs"
              description="Productos oficiales"
              href="/souvenirs"
              icon={<Award size={32} />}
              gradient="from-purple-500/20 to-purple-500/5"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 bg-secondary">
        <div className="container-adventure">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="500+" label="Miembros Activos" delay={0} />
            <StatCard number="50+" label="Eventos Anuales" delay={0.1} />
            <StatCard number="10+" label="Ciudades" delay={0.2} />
            <StatCard number="15" label="Años de Historia" delay={0.3} />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-b from-secondary to-black">
        <div className="container-adventure text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para la Aventura?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Únete a la comunidad de motociclistas más comprometida con el servicio social en Medellín.
            </p>
            <Link to="/inscripcion" className="btn-adventure inline-flex items-center gap-2">
              Inscríbete Ahora
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function QuickAccessCard({ 
  title, 
  description, 
  href, 
  icon, 
  gradient, 
  delay 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Link to={href} className="block group">
        <div className={`card-adventure h-full bg-gradient-to-br ${gradient} hover:scale-105 transition-adventure`}>
          <div className="text-primary mb-4 group-hover:animate-pulse-glow">{icon}</div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-4">{description}</p>
          <div className="flex items-center text-primary text-sm font-semibold">
            Ver más
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-adventure" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatCard({ number, label, delay }: { number: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <div className="text-5xl md:text-6xl font-black text-primary mb-2 text-glow-adventure">
        {number}
      </div>
      <div className="text-gray-400 text-sm md:text-base font-medium">{label}</div>
    </motion.div>
  );
}

function AdventureRoadAnimation() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M-100 540 Q480 300, 960 540 T 2020 540"
        stroke="url(#gradient1)"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
      <motion.path
        d="M-100 600 Q480 360, 960 600 T 2020 600"
        stroke="url(#gradient2)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD200" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFD200" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFD200" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD200" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFD200" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFD200" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
