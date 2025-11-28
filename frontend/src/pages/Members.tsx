import { motion } from 'framer-motion';
import { Users, Award, Shield, Crown } from 'lucide-react';

/**
 * Página Members - Comunidad Adventure
 */
export default function Members() {
  const roles = [
    { icon: <Crown size={32} />, name: 'Presidente', count: 1, color: 'text-yellow-400' },
    { icon: <Shield size={32} />, name: 'Vicepresidente', count: 1, color: 'text-blue-400' },
    { icon: <Award size={32} />, name: 'Directivos', count: 8, color: 'text-purple-400' },
    { icon: <Users size={32} />, name: 'Miembros', count: '500+', color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-black scrollbar-adventure">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-black to-secondary">
        <div className="container-adventure text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 text-glow-adventure"
          >
            Nuestra Comunidad
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Más de 500 motociclistas unidos por la aventura y el compromiso social
          </motion.p>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-secondary">
        <div className="container-adventure">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-adventure text-center hover:scale-105 transition-adventure"
              >
                <div className={`${role.color} mb-4 flex justify-center`}>{role.icon}</div>
                <div className="text-3xl font-black text-white mb-2">{role.count}</div>
                <div className="text-gray-400">{role.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-secondary to-black">
        <div className="container-adventure text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Únete a Nuestra Familia</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Si compartes nuestra pasión por las motos y el servicio social, sería un honor tenerte con nosotros.
            </p>
            <a href="/inscripcion" className="btn-adventure inline-block">
              Solicitar Membresía
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
