import React from "react";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { DarkModeToggle } from "../ui/dark-mode-toggle";

/**
 * Header del panel de administración.
 * Muestra el nombre y rol del usuario autenticado, y botón de logout.
 */
export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <header className="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
          Panel de Administración
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Fundación L.A.M.A. Medellín
        </p>
      </div>

      {/* Información del usuario y controles */}
      <div className="flex items-center gap-4">
        {/* Toggle dark mode */}
        <DarkModeToggle />

        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-700 px-4 py-2 rounded-lg">
          <User className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
          <div className="text-sm">
            <p className="font-semibold text-neutral-900 dark:text-neutral-50">
              {user?.name || "Usuario"}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {user?.roles?.join(", ") || "Sin rol asignado"}
            </p>
          </div>
        </div>

        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
};
