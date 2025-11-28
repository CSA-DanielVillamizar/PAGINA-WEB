import { motion } from 'framer-motion';
import { Calendar, Globe, MapPin, Users, Award } from 'lucide-react';
import HeroHistory from '../components/history/HeroHistory';
import Timeline from '../components/history/Timeline';
import FounderCard from '../components/history/FounderCard';
import StatsSection from '../components/history/StatsSection';

/**
 * Página Historia - Historia Global de L.A.M.A. y Capítulo Medellín
 * Diseño Adventure: Carretera en el tiempo con estilo cinematográfico
 */
export default function History() {
  return (
    <div className="min-h-screen bg-black scrollbar-adventure">
      {/* Hero Section */}
      <HeroHistory />

      {/* Timeline Section */}
      <Timeline />

      {/* Founder Section */}
      <FounderCard />

      {/* Stats/Metrics Section */}
      <StatsSection />

      {/* Closing Statement */}
      <section className="py-20 bg-gradient-to-t from-secondary to-black">
        <div className="container-adventure">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-adventure bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-center border-2 border-primary max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              De Chicago a Medellín
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Una historia de <span className="text-primary font-bold">47 años</span> que comenzó con un sueño en las calles de Chicago 
              y hoy se materializa en las montañas de Medellín como <span className="text-white font-semibold">Fundación con propósito social</span>.
            </p>
            <div className="text-4xl text-primary font-black text-glow-adventure">
              🏍️ 1977 - 2025 💛
            </div>
            <p className="text-2xl text-white font-bold mt-6 italic">
              Una tradición que trasciende fronteras y generaciones.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
