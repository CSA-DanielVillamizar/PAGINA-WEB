"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/components/ui/toast";

/**
 * useAuth - Hook personalizado para manejo de autenticación
 * 
 * Características:
 * - Acceso directo al estado de autenticación
 * - Métodos de login/logout encapsulados
 * - Validación de sesión activa
 * - Verificación de roles
 */
export function useAuth() {
  const { user, token, login, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();

  /**
   * Verificar si el usuario está autenticado
   */
  const isAuthenticated = !!token && !!user;

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return roles.some((role) => user.roles.includes(role));
  };

  /**
   * Verificar si el usuario tiene permisos de administrador
   */
  const isAdmin = hasAnyRole([
    "Presidente",
    "Vicepresidente",
    "Secretario",
    "Tesorero",
    "Administrador",
    "GerenciaNegocios",
    "CommunityManager",
    "MTO",
  ]);

  /**
   * Login con manejo de errores
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      showToast("success", "✅ Inicio de sesión exitoso");
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message || "Error al iniciar sesión";
      showToast("error", `❌ ${message}`);
      return false;
    }
  };

  /**
   * Logout con manejo de redireccionamiento
   */
  const handleLogout = () => {
    logout();
    showToast("success", "✅ Sesión cerrada correctamente");
    router.push("/auth/login");
  };

  /**
   * Require autenticación - redirigir a login si no está autenticado
   */
  const requireAuth = () => {
    if (!isAuthenticated) {
      showToast("warning", "⚠ Debes iniciar sesión para continuar");
      router.push("/auth/login");
    }
  };

  /**
   * Require rol específico - redirigir si no tiene permiso
   */
  const requireRole = (roles: string[]) => {
    if (!isAuthenticated) {
      showToast("warning", "⚠ Debes iniciar sesión para continuar");
      router.push("/auth/login");
      return;
    }

    if (!hasAnyRole(roles)) {
      showToast("error", "🔒 No tienes permisos para acceder a esta sección");
      router.push("/denied");
    }
  };

  return {
    // Estado
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin,

    // Métodos
    login: handleLogin,
    logout: handleLogout,
    hasRole,
    hasAnyRole,
    requireAuth,
    requireRole,
  };
}

/**
 * useSessionTimeout - Hook para manejo de timeout de sesión
 * 
 * Características:
 * - Detecta inactividad del usuario
 * - Muestra advertencias antes del cierre
 * - Cierra sesión automáticamente después del timeout
 * - Configurable (tiempo de timeout)
 */
interface UseSessionTimeoutOptions {
  timeoutMinutes?: number; // Tiempo de inactividad en minutos (default: 15)
  warningMinutes?: number; // Tiempo antes del timeout para mostrar advertencia (default: 2)
  onWarning?: () => void; // Callback cuando se muestra advertencia
  onTimeout?: () => void; // Callback cuando expira la sesión
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    timeoutMinutes = 15,
    warningMinutes = 2,
    onWarning,
    onTimeout,
  } = options;

  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  /**
   * Resetear timers de timeout
   */
  const resetTimeout = () => {
    // Limpiar timers existentes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // No configurar timers si no está autenticado
    if (!isAuthenticated) return;

    // Timer de advertencia
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      showToast(
        "warning",
        `⏰ Tu sesión expirará en ${warningMinutes} minutos por inactividad`
      );
      onWarning?.();
    }, warningMs);

    // Timer de timeout
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      logout();
      showToast(
        "warning",
        "🕒 Tu sesión expiró por inactividad. Por favor, vuelve a iniciar sesión."
      );
      router.push("/auth/expired");
      onTimeout?.();
    }, timeoutMs);
  };

  /**
   * Configurar listeners de actividad
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    // Eventos que resetean el timeout
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Resetear timeout en cada evento de actividad
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    // Iniciar timers
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAuthenticated]);

  return {
    resetTimeout,
  };
}
