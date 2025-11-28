"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

/**
 * Avatar - Componente de avatar con iniciales y glow Adventure
 * 
 * Características:
 * - Genera iniciales automáticamente del nombre
 * - Glow amarillo neón en hover
 * - Múltiples tamaños
 * - Color de fondo basado en el nombre (consistente)
 */
export function Avatar({ name, size = "md", className, showGlow = true }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  // Generar iniciales
  const initials = useMemo(() => {
    if (!name) return "?";
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  // Generar color de fondo consistente basado en el nombre
  const backgroundColor = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generar tonos oscuros que contrasten con el amarillo
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 30%, 25%)`;
  }, [name]);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative rounded-full flex items-center justify-center font-semibold",
        "border-2 border-primary/50 cursor-pointer",
        sizes[size],
        showGlow && "hover:glow-adventure transition-adventure",
        className
      )}
      style={{ backgroundColor }}
      title={name}
    >
      <span className="text-primary select-none">{initials}</span>
      
      {/* Ring de estado online (opcional) */}
      {showGlow && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
      )}
    </motion.div>
  );
}

/**
 * AvatarGroup - Grupo de avatares con stack horizontal
 */
interface AvatarGroupProps {
  users: Array<{ name: string; id: string }>;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AvatarGroup({ users, max = 3, size = "md" }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user) => (
        <Avatar key={user.id} name={user.name} size={size} showGlow={false} />
      ))}
      
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-semibold",
            "bg-secondary border-2 border-primary/50 text-primary",
            size === "sm" && "w-8 h-8 text-xs",
            size === "md" && "w-10 h-10 text-sm",
            size === "lg" && "w-12 h-12 text-base",
            size === "xl" && "w-16 h-16 text-xl"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
