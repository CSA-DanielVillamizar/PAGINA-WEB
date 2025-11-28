"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, Shield, LogOut, Menu, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/components/ui/toast";

/**
 * Navbar - Barra de navegación institucional Adventure
 * 
 * Características:
 * - Logo institucional con link a home
 * - Avatar del usuario con menú dropdown
 * - Links de navegación principales
 * - Responsive con menú hamburguesa
 * - Solo visible si hay sesión activa
 */
export function Navbar() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, token, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // No renderizar si no hay sesión
  if (!token || !user) return null;

  // Verificar si el usuario tiene permisos de admin
  const adminRoles = [
    "Presidente",
    "Vicepresidente",
    "Secretario",
    "Tesorero",
    "Administrador",
    "GerenciaNegocios",
    "CommunityManager",
    "MTO",
  ];
  const hasAdminAccess = user.roles?.some((role: string) => adminRoles.includes(role));

  const handleLogout = () => {
    logout();
    showToast("success", "✅ Sesión cerrada correctamente");
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border-2 border-primary glow-adventure-sm flex items-center justify-center group-hover:scale-110 transition-adventure">
              <span className="text-lg font-bold text-primary">L</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                Fundación L.A.M.A.
              </p>
              <p className="text-xs text-muted-foreground">Medellín</p>
            </div>
          </Link>

          {/* Links de navegación - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/eventos">Eventos</NavLink>
            <NavLink href="/noticias">Noticias</NavLink>
            <NavLink href="/souvenirs">Souvenirs</NavLink>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Menú usuario - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-secondary/50 rounded-lg px-3 py-2 transition-adventure"
              >
                <Avatar name={user.name} size="sm" showGlow={false} />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.roles?.[0] || "Miembro"}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    {/* Overlay para cerrar */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-40"
                    >
                      <div className="p-3 border-b border-border bg-secondary/30">
                        <p className="text-sm font-medium text-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {user.roles?.join(", ") || "Sin rol"}
                        </p>
                      </div>

                      <div className="py-1">
                        <MenuItem
                          icon={<User className="w-4 h-4" />}
                          label="Mi Perfil"
                          onClick={() => {
                            router.push("/perfil");
                            setIsUserMenuOpen(false);
                          }}
                        />

                        {hasAdminAccess && (
                          <MenuItem
                            icon={<Shield className="w-4 h-4" />}
                            label="Panel Admin"
                            onClick={() => {
                              router.push("/admin");
                              setIsUserMenuOpen(false);
                            }}
                            highlight
                          />
                        )}

                        <MenuItem
                          icon={<Settings className="w-4 h-4" />}
                          label="Configuración"
                          onClick={() => {
                            router.push("/configuracion");
                            setIsUserMenuOpen(false);
                          }}
                        />

                        <div className="border-t border-border my-1" />

                        <MenuItem
                          icon={<LogOut className="w-4 h-4" />}
                          label="Cerrar Sesión"
                          onClick={handleLogout}
                          danger
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Menú hamburguesa - Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary/50 rounded-lg transition-adventure"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Menú Mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="py-4 space-y-2">
                <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
                  Inicio
                </MobileNavLink>
                <MobileNavLink href="/eventos" onClick={() => setIsMenuOpen(false)}>
                  Eventos
                </MobileNavLink>
                <MobileNavLink href="/noticias" onClick={() => setIsMenuOpen(false)}>
                  Noticias
                </MobileNavLink>
                <MobileNavLink href="/souvenirs" onClick={() => setIsMenuOpen(false)}>
                  Souvenirs
                </MobileNavLink>

                <div className="border-t border-border my-2" />

                <MobileNavLink href="/perfil" onClick={() => setIsMenuOpen(false)}>
                  <User className="w-4 h-4" />
                  Mi Perfil
                </MobileNavLink>

                {hasAdminAccess && (
                  <MobileNavLink href="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Shield className="w-4 h-4" />
                    Panel Admin
                  </MobileNavLink>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-adventure"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

/**
 * NavLink - Link de navegación para desktop
 */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

/**
 * MobileNavLink - Link de navegación para mobile
 */
function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg transition-adventure"
    >
      {children}
    </Link>
  );
}

/**
 * MenuItem - Item del menú dropdown
 */
function MenuItem({
  icon,
  label,
  onClick,
  highlight,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2 text-sm transition-adventure
        ${danger ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-secondary/50"}
        ${highlight ? "text-primary hover:bg-primary/10" : ""}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
