"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ExpiredPage - Página para manejar sesiones expiradas
 * 
 * Características:
 * - Diseño Adventure institucional
 * - CTAs claros (volver a login o ir a home)
 * - Animaciones suaves
 * - Mensaje UX amigable
 */
export default function ExpiredPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-md"
      >
        <div className="card-adventure text-center">
          {/* Icono animado */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center glow-adventure">
              <Clock className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Tu sesión expiró
          </h1>

          {/* Mensaje */}
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Por tu seguridad, cerramos tu sesión después de un período de inactividad.
            Por favor, vuelve a iniciar sesión para continuar.
          </p>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full btn-adventure h-12 text-base font-semibold"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Volver a Iniciar Sesión
            </Button>

            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-12 text-base border-border hover:border-primary transition-adventure"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Button>
          </div>

          {/* Nota de seguridad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-3 bg-secondary/50 rounded-lg border border-border"
          >
            <p className="text-xs text-muted-foreground">
              🔒 Las sesiones expiran automáticamente después de <strong>15 minutos</strong> de inactividad
              para proteger tu cuenta.
            </p>
          </motion.div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ¿Problemas para acceder?{" "}
              <a
                href="mailto:soporte@fundacionlamamedellin.org"
                className="text-primary hover:underline"
              >
                Contacta soporte
              </a>
            </p>
          </div>
        </div>

        {/* Logo institucional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">L</span>
            </div>
            <span className="text-xs">Fundación L.A.M.A. Medellín</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
