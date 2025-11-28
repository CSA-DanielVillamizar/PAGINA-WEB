"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Newspaper, ShoppingBag, Users, ArrowRight, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * HomePage - Página principal Adventure de la Fundación
 * 
 * Características:
 * - Hero cinematográfico con moto animada
 * - Secciones de acceso rápido
 * - Estadísticas en tiempo real
 * - CTA claros y visibles
 * - Footer institucional completo
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Adventure */}
      <HeroSection />

      {/* Accesos Rápidos */}
      <QuickAccessSection />

      {/* Estadísticas */}
      <StatsSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

/**
 * HeroSection - Sección hero con animaciones Adventure
 */
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
      {/* Fondo con gradiente Adventure */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background opacity-80" />
      
      {/* Líneas de ruta animadas */}
      <AdventureRoadAnimation />

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo grande */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center mb-8"
          >
            <div className="w-32 h-32 rounded-full border-4 border-primary glow-adventure flex items-center justify-center">
              <span className="text-6xl font-bold text-primary">L</span>
            </div>
          </motion.div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
            <span className="block mb-2">VIVE LA</span>
            <span className="text-primary text-glow-adventure">AVENTURA.</span>
          </h1>

          {/* Subtítulo */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-semibold text-foreground mb-6"
          >
            AYUDA A LA COMUNIDAD.
          </motion.h2>

          {/* Eslogan */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Recorremos el camino de la solidaridad sobre dos ruedas
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="btn-adventure text-lg px-8 h-14">
              <Link href="/inscripcion">
                Únete a L.A.M.A.
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 h-14 border-primary/50 hover:border-primary hover:bg-primary/10"
            >
              <Link href="/sobre-nosotros">
                Conócenos
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

/**
 * QuickAccessSection - Sección de accesos rápidos
 */
function QuickAccessSection() {
  const sections = [
    {
      icon: Users,
      title: "Miembros",
      description: "Conoce a nuestra comunidad motociclista",
      href: "/miembros",
      color: "from-primary/20 to-primary/5",
    },
    {
      icon: Calendar,
      title: "Eventos",
      description: "Próximas rodadas y actividades",
      href: "/eventos",
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: Newspaper,
      title: "Noticias",
      description: "Últimas novedades de la Fundación",
      href: "/noticias",
      color: "from-green-500/20 to-green-500/5",
    },
    {
      icon: ShoppingBag,
      title: "Souvenirs",
      description: "Productos y merchandising oficial",
      href: "/souvenirs",
      color: "from-purple-500/20 to-purple-500/5",
    },
  ];

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Accesos Rápidos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestras secciones y descubre todo lo que L.A.M.A. Medellín tiene para ti
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={section.href}>
                <div className={`
                  card-adventure h-full group cursor-pointer
                  bg-gradient-to-br ${section.color}
                `}>
                  <section.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-adventure" />
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                  <ArrowRight className="w-5 h-5 text-primary mt-4 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * StatsSection - Sección de estadísticas
 */
function StatsSection() {
  const stats = [
    { value: "500+", label: "Miembros Activos", icon: Users },
    { value: "50+", label: "Eventos Anuales", icon: Calendar },
    { value: "10+", label: "Ciudades", icon: MapPin },
    { value: "15", label: "Años de Historia", icon: Heart },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-4xl md:text-5xl font-bold text-primary text-glow-adventure mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Footer - Footer institucional
 */
function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Columna 1: Logo e info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary">L</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Fundación L.A.M.A.</p>
                <p className="text-xs text-muted-foreground">Medellín</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Mototurismo con propósito. Cultura que deja huella.
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre-nosotros" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/donaciones" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Donaciones
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Medellín, Colombia</li>
              <li>
                <a href="mailto:info@fundacionlamamedellin.org" className="hover:text-primary transition-colors">
                  info@fundacionlamamedellin.org
                </a>
              </li>
              <li>
                <a href="tel:+573001234567" className="hover:text-primary transition-colors">
                  +57 300 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Fundación L.A.M.A. Medellín. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * AdventureRoadAnimation - Animación de ruta en el fondo
 */
function AdventureRoadAnimation() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
      <defs>
        <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      
      <motion.path
        d="M-200,300 Q400,200 800,300 T1800,300"
        stroke="url(#roadGradient)"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
      
      <motion.path
        d="M-200,500 Q400,400 800,500 T1800,500"
        stroke="url(#roadGradient)"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
      />
    </svg>
  );
}
