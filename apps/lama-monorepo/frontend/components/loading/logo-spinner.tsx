"use client";

import { motion } from "framer-motion";

interface LogoSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

/**
 * LogoSpinner - Componente de carga con animación de llanta Adventure
 * 
 * Características:
 * - Llanta giratoria con glow amarillo neón
 * - Múltiples tamaños responsivos
 * - Texto opcional institucional
 * - Animación suave con Framer Motion
 */
export function LogoSpinner({ size = "md", showText = false }: LogoSpinnerProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Llanta giratoria con glow */}
      <motion.div
        className={`${sizes[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Círculo exterior con border amarillo neón */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
        
        {/* Círculo medio con glow */}
        <div className="absolute inset-2 rounded-full border-4 border-primary glow-adventure"></div>
        
        {/* Centro sólido */}
        <div className="absolute inset-1/3 rounded-full bg-primary"></div>
        
        {/* Rayos de la llanta */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 bg-primary origin-left"
            style={{
              height: "40%",
              transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>

      {/* Texto opcional */}
      {showText && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm font-semibold text-primary text-glow-adventure">
            Cargando...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Fundación L.A.M.A. Medellín
          </p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * FullPageSpinner - Spinner a pantalla completa para transiciones de página
 */
export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <LogoSpinner size="xl" showText />
    </div>
  );
}

/**
 * InlineSpinner - Spinner pequeño para botones y elementos inline
 */
export function InlineSpinner() {
  return (
    <motion.div
      className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
