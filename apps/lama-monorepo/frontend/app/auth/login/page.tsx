"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogoSpinner } from "@/components/loading/logo-spinner";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/auth";

/**
 * LoginPage - Página de autenticación Adventure institucional
 * 
 * Características:
 * - Validación de dominio institucional @fundacionlamamedellin.org
 * - Estados visuales claros (focus, error, success)
 * - Animaciones con Framer Motion
 * - Fondo Adventure con moto animada
 * - Loader con llanta giratoria
 * - Mensajes UX contextuales
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Manejo de mensajes de error desde URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      showToast("warning", "⚠ Debes iniciar sesión para continuar");
    } else if (error === "token_expired") {
      showToast("warning", "🕒 Tu sesión expiró por seguridad. Vuelve a iniciar sesión.");
    } else if (error === "access_denied") {
      showToast("error", "🔒 Acceso restringido. No tienes permisos suficientes.");
    }
  }, [searchParams, showToast]);

  /**
   * Validar formato de email institucional
   */
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "El correo es requerido" }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Formato de correo inválido" }));
      return false;
    }

    // Validar dominio institucional
    if (!email.endsWith("@fundacionlamamedellin.org")) {
      setErrors((prev) => ({
        ...prev,
        email: "Debes usar tu correo institucional @fundacionlamamedellin.org",
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  /**
   * Validar contraseña
   */
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "La contraseña es requerida" }));
      return false;
    }

    if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Mínimo 6 caracteres" }));
      return false;
    }

    setErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await login(email, password);
      showToast("success", "✅ Inicio de sesión exitoso. Bienvenido!");
      router.push("/");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Credenciales incorrectas";
      showToast("error", `❌ ${message}`);
      setErrors({
        email: "Verifica tus credenciales",
        password: "Verifica tus credenciales",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Fondo Adventure con ruta animada */}
      <AdventureBackground />

      {/* Formulario de Login */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="card-adventure backdrop-blur-lg bg-card/90">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              {/* Logo institucional */}
              <div className="w-20 h-20 rounded-full border-4 border-primary glow-adventure flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">L</span>
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Inicio de Sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Fundación L.A.M.A. Medellín
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.nombre@fundacionlamamedellin.org"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  error={errors.email}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) validatePassword(e.target.value);
                  }}
                  onBlur={() => validatePassword(password)}
                  error={errors.password}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Botón Submit */}
            <Button
              type="submit"
              className="w-full btn-adventure h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LogoSpinner size="sm" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
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

        {/* Nota institucional */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-xs text-muted-foreground"
        >
          Acceso exclusivo para miembros de la Fundación
        </motion.p>
      </motion.div>
    </div>
  );
}

/**
 * AdventureBackground - Fondo animado con ruta Adventure
 */
function AdventureBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background opacity-50"></div>

      {/* Líneas de ruta animadas */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M0,200 Q400,100 800,200 T1600,200"
          stroke="url(#roadGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M0,400 Q400,300 800,400 T1600,400"
          stroke="url(#roadGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
        />
      </svg>

      {/* Partículas de luz amarilla */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}
