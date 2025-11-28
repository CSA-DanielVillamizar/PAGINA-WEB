import React from "react";
import Link from "next/link";
import { AlertCircle, Home, LogIn } from "lucide-react";

/**
 * Página de acceso denegado para usuarios sin permisos administrativos.
 * Diseño institucional coherente con la Fundación L.A.M.A. Medellín.
 */
export default function DeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-neutral-800 shadow-2xl rounded-2xl p-8 md:p-12 text-center">
        {/* Icono de alerta */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          Acceso Denegado
        </h1>

        {/* Mensaje descriptivo */}
        <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
          No tienes permisos para acceder a esta sección del sistema.
        </p>

        {/* Información adicional */}
        <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6 mb-8 text-left">
          <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
            Si consideras que esto es un error, por favor contacta con la{" "}
            <span className="font-semibold">Junta Directiva</span> o un{" "}
            <span className="font-semibold">administrador del sistema</span>.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            Regresar al inicio
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors border border-neutral-300 dark:border-neutral-600"
          >
            <LogIn className="w-5 h-5" />
            Iniciar sesión con otra cuenta
          </Link>
        </div>

        {/* Pie de página institucional */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Fundación L.A.M.A. Medellín © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
