import { motion } from 'framer-motion';
import { Target, Heart, Users, Award } from 'lucide-react';

/**
 * Página About - Información institucional Adventure
 */
export default function About() {
  const values = [
    {
      icon: <Target size={40} />,
      title: 'Misión',
      description: 'Fomentar el mototurismo responsable mientras servimos a las comunidades que visitamos.',
    },
    {
      icon: <Heart size={40} />,
      title: 'Pasión',
      description: 'Vivimos por la aventura en dos ruedas y el compromiso social con quienes más lo necesitan.',
    },
    {
      icon: <Users size={40} />,
      title: 'Comunidad',
      description: 'Una familia de motociclistas unidos por valores de respeto, solidaridad y aventura.',
    },
    {
      icon: <Award size={40} />,
      title: 'Excelencia',
      description: 'Buscamos la excelencia en cada evento, ruta y acción social que emprendemos.',
    },
  ];

  return (
    <div className="min-h-screen bg-black scrollbar-adventure">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-black to-secondary overflow-hidden">
        <div className="container-adventure relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-5xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 text-glow-adventure">
              FUNDACIÓN L.A.M.A. MEDELLÍN
            </h1>
            <p className="text-2xl text-primary font-semibold mb-8">
              Mototurismo con propósito. Cultura que deja huella.
            </p>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed text-left">
              <p>
                Somos la <span className="text-white font-semibold">Fundación L.A.M.A. Medellín</span>, una entidad sin ánimo de lucro de carácter privado que nace desde la ciudad de Medellín como <span className="text-primary font-semibold">modelo pionero en Colombia</span> para promover el mototurismo responsable, la cultura ciudadana y el fortalecimiento de la identidad cultural y territorial a través de la hermandad motociclista.
              </p>
              <p>
                Nuestra Fundación tiene como propósito <span className="text-white font-semibold">preservar, dignificar y proyectar el mototurismo como patrimonio cultural vivo</span>, a la vez que impulsamos iniciativas de impacto social, integración comunitaria, movilidad responsable y promoción del respeto y la convivencia en las vías.
              </p>
              <p>
                Actuamos bajo principios de <span className="text-primary font-semibold">transparencia, responsabilidad, disciplina institucional y compromiso con la transformación ciudadana</span>, fortaleciendo alianzas estratégicas con entidades públicas, privadas y organizaciones nacionales e internacionales.
              </p>
              <p>
                Desde <span className="text-white font-semibold">Medellín — capital de innovación y motor cultural del país</span> — asumimos el compromiso de ser referente nacional y continental en la integración entre pasión motociclista, impacto social y construcción de ciudadanía.
              </p>
              <div className="text-center pt-8">
                <p className="text-2xl text-white font-bold mb-2">Somos más que una ruta.</p>
                <p className="text-3xl text-primary font-black text-glow-adventure">Somos un legado en movimiento.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-20 bg-secondary">
        <div className="container-adventure">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl font-black text-white mb-8 text-center">
              🏍️ Nuestra Historia: De Capítulo Motero a Fundación con Propósito
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-adventure"
            >
              <h3 className="text-3xl font-bold text-primary mb-6">
                El Origen: Naciendo en el Corazón del Mototurismo (2013-2024)
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  Fundado en <span className="text-white font-semibold">2013</span> en Medellín, capital del mototurismo cultural de Colombia, el Capítulo L.A.M.A. Medellín nació del sueño compartido de un grupo de motociclistas: combinar la pasión indomable por las dos ruedas con un <span className="text-primary font-semibold">impacto positivo y tangible en la sociedad</span>.
                </p>
                <p>
                  A lo largo de más de una década, hemos forjado nuestra historia en el asfalto. Hemos recorrido miles de kilómetros, hemos organizado más de <span className="text-white font-semibold">20 eventos anuales</span> y hemos logrado ayudar a decenas de comunidades en zonas rurales de Antioquia y Colombia. Hoy, somos más de 30 miembros activos, todos firmemente comprometidos con los valores innegociables de <span className="text-primary font-semibold">solidaridad, respeto y aventura</span> que definen a L.A.M.A. International.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card-adventure bg-gradient-to-br from-primary/10 to-transparent"
            >
              <div className="text-center mb-8">
                <div className="text-6xl font-black text-primary mb-4 text-glow-adventure">12+</div>
                <div className="text-xl text-white font-semibold mb-2">Años de Historia</div>
                <div className="text-gray-400">Construyendo comunidad desde 2013</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary mb-2">20+</div>
                  <div className="text-sm text-gray-400">Eventos Anuales</div>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary mb-2">30+</div>
                  <div className="text-sm text-gray-400">Miembros Activos</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-adventure bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary"
          >
            <h3 className="text-3xl font-bold text-white mb-6">
              La Evolución: Nacimiento de la Fundación L.A.M.A. Medellín (2025)
            </h3>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                El año <span className="text-primary font-bold">2025</span> marca un hito trascendental en nuestra trayectoria. Hemos decidido evolucionar de un capítulo de mototurismo a la <span className="text-white font-bold">Fundación L.A.M.A. Medellín, legalmente reconocida</span>.
              </p>
              <p>
                Somos la <span className="text-primary font-bold">primera organización motociclista en Colombia</span> que da este paso institucional, elevando nuestra actividad a la categoría de <span className="text-white font-semibold">patrimonio vivo</span> que transforma territorios y fortalece la identidad nacional.
              </p>
              
              <div className="bg-black/30 rounded-lg p-6 my-6">
                <h4 className="text-xl font-bold text-primary mb-4">Nuestro Propósito como Fundación es Claro:</h4>
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-gray-300">
                    <span className="text-white font-semibold">Transformación Territorial:</span> Impulsar el mototurismo como un acto de nación, memoria y legado, que transforma comunidades.
                  </li>
                  <li className="text-gray-300">
                    <span className="text-white font-semibold">Agentes de Cambio:</span> Dignificar al motociclista como un agente de transformación social, cultural y ciudadano.
                  </li>
                </ol>
              </div>

              <p className="text-lg text-white italic">
                Ya no somos solo un capítulo de rodada. Somos una <span className="text-primary font-bold">fuerza cultural, social e institucional</span> que conecta pasión, territorio y propósito. Recorremos caminos para <span className="text-primary font-bold">dejar huella, no solo kilómetros</span>.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-adventure mt-12"
          >
            <h3 className="text-3xl font-bold text-primary mb-6">La Misión</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              Trabajamos en alianza estratégica con entidades públicas, privadas y comunitarias para:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">•</span>
                <span>Impulsar la <span className="text-white font-semibold">movilidad responsable</span> y la seguridad vial.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">•</span>
                <span>Fomentar la <span className="text-white font-semibold">integración territorial</span> y el turismo consciente.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">•</span>
                <span>Proyectar a Medellín y Colombia ante el mundo como un destino de mototurismo de alto impacto social y cultural.</span>
              </li>
            </ul>
            <p className="text-xl text-primary font-bold mt-6 text-center italic">
              Desde Medellín para Colombia y el mundo, la Fundación L.A.M.A. Medellín está redefiniendo el significado de montar en moto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Identidad Estratégica */}
      <section className="py-20 bg-gradient-to-b from-black to-secondary">
        <div className="container-adventure">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-white mb-4">
              🌟 Identidad Estratégica
            </h2>
            <p className="text-2xl text-primary font-semibold mb-2">
              El Legado de la Fundación L.A.M.A. Medellín
            </p>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Esta declaración es el manifiesto de nuestro compromiso con el motociclismo y la sociedad.
            </p>
          </motion.div>

          {/* Propósito Superior */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-adventure bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">🎯</div>
              <h3 className="text-3xl font-bold text-white">Propósito Superior</h3>
            </div>
            <blockquote className="text-xl text-gray-300 leading-relaxed border-l-4 border-primary pl-6 italic">
              Elevar el mototurismo a la categoría de <span className="text-primary font-bold">Patrimonio Cultural Vivo</span> al servicio de la identidad, la integración territorial y el desarrollo humano, proyectando nuestra visión desde Medellín hacia Colombia y el mundo.
            </blockquote>
          </motion.div>

          {/* Misión */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-adventure mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">🛣️</div>
              <h3 className="text-3xl font-bold text-primary">Misión</h3>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Somos la <span className="text-white font-bold">Fundación L.A.M.A. Medellín</span>, una organización comprometida con la transformación. Fortalecemos la cultura mototurística como una <span className="text-primary font-semibold">fuerza social, educativa y transformadora</span>, promoviendo:
              </p>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-1">•</span>
                  <span>La <span className="text-white font-semibold">hermandad incondicional</span> y el respeto.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-1">•</span>
                  <span>La <span className="text-white font-semibold">responsabilidad vial</span> y la movilidad consciente.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-1">•</span>
                  <span>El <span className="text-white font-semibold">orgullo territorial</span> y la dignificación del motociclista.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-1">•</span>
                  <span>El <span className="text-white font-semibold">impacto positivo y duradero</span> en las comunidades que recorremos.</span>
                </li>
              </ul>
              <p className="pt-4">
                Actuamos con <span className="text-white font-semibold">disciplina institucional, transparencia y propósito superior</span>, articulando los esfuerzos entre la ciudadanía, la cultura, el sector público y el voluntariado motociclista.
              </p>
            </div>
          </motion.div>

          {/* Visión 2030 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-adventure bg-gradient-to-r from-secondary to-black border-l-4 border-primary mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">✨</div>
              <h3 className="text-3xl font-bold text-white">Visión <span className="text-primary">(2030)</span></h3>
            </div>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Para el año <span className="text-primary font-bold">2030</span>, seremos reconocidos como la organización mototurística con el <span className="text-white font-bold">mayor impacto cultural y social en Colombia</span>.
              </p>
              <p>
                Nos convertiremos en un referente continental de identidad, movilidad consciente y construcción comunitaria:
              </p>
              <blockquote className="text-xl text-white font-semibold border-l-4 border-primary pl-6 py-4 my-4 italic bg-black/30 rounded-r-lg">
                Una Fundación respetada por las instituciones, admirada por los territorios y honrada por las futuras generaciones del mototurismo.
              </blockquote>
            </div>
          </motion.div>

          {/* Declaración de Esencia */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-adventure bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-center border-2 border-primary/50"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-4xl">🚩</div>
              <h3 className="text-3xl font-bold text-primary">Declaración de Esencia</h3>
            </div>
            <div className="space-y-6">
              <p className="text-gray-400 text-sm uppercase tracking-wider">Nuestro Lema</p>
              <blockquote className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                No solo recorremos caminos.<br />
                <span className="text-primary text-glow-adventure">Dejamos huella.</span>
              </blockquote>
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto italic">
                Llevamos en alto el nombre de <span className="text-primary font-bold">Medellín</span> — no como punto geográfico, sino como <span className="text-white font-semibold">ciudad faro de cultura, hermandad y transformación social</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-gradient-to-b from-secondary to-black">
        <div className="container-adventure">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white text-center mb-12"
          >
            Nuestros Valores
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-adventure text-center hover:scale-105 transition-adventure"
              >
                <div className="text-primary mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
