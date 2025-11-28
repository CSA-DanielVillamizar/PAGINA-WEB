import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, AlertCircle } from 'lucide-react';

/**
 * Página de Requisitos de Membresía L.A.M.A. Medellín
 * Documenta los requisitos generales internacionales y excepciones locales Colombia.
 * Arquitectura: Contenido estático con enlaces a formulario y estatutos.
 */
export default function MembershipRequirements() {
  return (
    <div className="min-h-screen bg-black scrollbar-adventure">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-secondary via-black to-black overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container-adventure relative z-10"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            REQUISITOS DE <span className="text-primary">MEMBRESÍA</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            CAPÍTULO L.A.M.A. Medellín - Fundación L.A.M.A. Medellín
          </p>
          <p className="text-primary font-semibold mt-2">Mototurismo con propósito. Cultura que deja huella.</p>
        </motion.div>
      </section>

      {/* Identidad Institucional */}
      <section className="py-16 bg-gradient-to-b from-black to-secondary">
        <div className="container-adventure">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-adventure"
          >
            <h2 className="text-3xl font-bold text-white mb-6">FUNDACIÓN L.A.M.A. MEDELLÍN</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Somos la <span className="text-primary font-semibold">primera organización motociclista en Colombia</span> que evoluciona de capítulo a Fundación legalmente reconocida, con propósito social, cultural y ciudadano.
              </p>
              <p>
                Nuestra Fundación tiene como propósito <span className="text-white font-semibold">preservar, dignificar y proyectar el mototurismo como patrimonio cultural vivo</span>, a la vez que impulsamos iniciativas de impacto social, integración comunitaria, movilidad responsable y promoción del respeto y la convivencia en las vías.
              </p>
              <p className="text-primary italic">
                "No solo recorremos caminos. Dejamos huella."
              </p>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-black/40 rounded-lg border border-primary/20">
                <h3 className="text-primary font-bold mb-2">PROPÓSITO SUPERIOR</h3>
                <p className="text-sm text-gray-300">Elevar el mototurismo a la categoría de patrimonio cultural vivo, desde Medellín hacia Colombia y el mundo.</p>
              </div>
              <div className="p-6 bg-black/40 rounded-lg border border-primary/20">
                <h3 className="text-primary font-bold mb-2">MISIÓN</h3>
                <p className="text-sm text-gray-300">Fortalecer la cultura mototurística como fuerza social, educativa y transformadora, promoviendo hermandad y responsabilidad vial.</p>
              </div>
              <div className="p-6 bg-black/40 rounded-lg border border-primary/20">
                <h3 className="text-primary font-bold mb-2">VISIÓN 2030</h3>
                <p className="text-sm text-gray-300">Ser reconocidos como la organización mototurística con mayor impacto cultural y social en Colombia.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Requisitos Generales */}
      <section className="py-16 bg-secondary">
        <div className="container-adventure">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">REQUISITOS GENERALES DE MEMBRESÍA</h2>
            <p className="text-gray-300">Según Estatutos Internacionales L.A.M.A. (Noviembre 2023)</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: CheckCircle2, title: 'Licencia de Conducción', desc: 'Poseer una licencia de motocicleta válida y vigente.' },
              { icon: CheckCircle2, title: 'Propiedad de Motocicleta', desc: 'Ser propietario de una motocicleta legalmente registrada.' },
              { icon: CheckCircle2, title: 'Cilindraje (Regla General)', desc: 'La motocicleta debe tener una cilindrada de 650 cc o más.' },
              { icon: CheckCircle2, title: 'Situación Laboral', desc: 'Estar empleado actualmente, ser propietario de un negocio o estar jubilado (con comprobante).' },
              { icon: CheckCircle2, title: 'Seguro', desc: 'Tener seguro cuando lo exija la ley.' },
              { icon: CheckCircle2, title: 'Compromiso con el Capítulo', desc: 'Asistir a al menos una reunión mensual, participar en mínimo dos viajes al mes y eventos patrocinados.' }
            ].map((req, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-adventure flex items-start gap-4"
              >
                <req.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-bold mb-2">{req.title}</h3>
                  <p className="text-gray-300 text-sm">{req.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Excepciones Colombia */}
      <section className="py-16 bg-gradient-to-b from-secondary to-black">
        <div className="container-adventure">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-adventure border-2 border-primary"
          >
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-10 h-10 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">EXCEPCIONES DE CILINDRAJE PARA COLOMBIA</h2>
                <p className="text-gray-300">Aplicación local según disponibilidad de motocicletas de alta cilindrada</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-primary/30">
                    <th className="py-3 px-4 text-primary font-bold">GÉNERO</th>
                    <th className="py-3 px-4 text-primary font-bold">REQUISITO DE CILINDRAJE</th>
                    <th className="py-3 px-4 text-primary font-bold">NOTAS</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-4 text-white font-semibold">Hombres</td>
                    <td className="py-4 px-4">
                      <span className="text-primary font-bold">Mínimo 650 cc</span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      Se permite temporalmente la incorporación de miembros con motocicletas de <span className="text-primary font-semibold">500 cc únicamente por 1 año a partir de Junio 2025</span>. Después, se retoma exigencia de 650 cc.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-white font-semibold">Mujeres (Damas de L.A.M.A.)</td>
                    <td className="py-4 px-4">
                      <span className="text-primary font-bold">Mínimo 250 cc</span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      Excepción local que permite a las mujeres afiliarse con motocicletas de menor cilindraje, siempre que cumplan con todos los demás requisitos generales.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-black/40 rounded-lg border border-primary/20">
              <p className="text-gray-300 text-sm">
                <span className="text-primary font-semibold">Nota Importante:</span> Las mujeres (Damas de L.A.M.A.) que se unen como miembros activos con su propia motocicleta deben cumplir con los mismos requisitos generales que los miembros masculinos, incluyendo el compromiso de conducción. Las que cumplen con todos los requisitos reciben el distintivo parche <span className="text-white font-bold">DAMA de L.A.M.A.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA: Estatutos y Formulario */}
      <section className="py-16 bg-black">
        <div className="container-adventure">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-6">¿LISTO PARA UNIRTE?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Antes de diligenciar el formulario, te invitamos a leer los Estatutos Internacionales de L.A.M.A. para conocer tus responsabilidades, derechos y compromisos como miembro.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/ESTATUTOS - LAMA.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-black transition-adventure flex items-center gap-3"
              >
                <FileText className="w-5 h-5" />
                Leer Estatutos L.A.M.A.
              </a>
              <Link
                to="/inscripcion"
                className="btn-adventure flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5" />
                Diligenciar Formulario de Inscripción
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
