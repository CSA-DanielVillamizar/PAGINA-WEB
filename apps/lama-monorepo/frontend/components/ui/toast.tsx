"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * ToastProvider - Proveedor de contexto para toasts globales
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, type, message, duration };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove después del duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook para usar toasts en componentes
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}

/**
 * ToastContainer - Contenedor de toasts con animaciones
 */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * ToastItem - Item individual de toast con animación
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-destructive" />,
    warning: <AlertTriangle className="w-5 h-5 text-primary" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borderColors = {
    success: "border-green-500/50",
    error: "border-destructive/50",
    warning: "border-primary/50",
    info: "border-blue-500/50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
        pointer-events-auto
        bg-card border ${borderColors[toast.type]}
        rounded-lg p-4 shadow-lg
        flex items-start gap-3
        min-w-[300px] max-w-sm
      `}
    >
      {/* Icono */}
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>

      {/* Mensaje */}
      <p className="flex-1 text-sm text-foreground leading-relaxed">
        {toast.message}
      </p>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
