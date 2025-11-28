"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Calendar, DollarSign, FileText, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";

/**
 * AdminPage - Página principal del panel de administración
 * 
 * Características:
 * - Dashboard con KPIs institucionales
 * - Estadísticas en tiempo real
 * - Gráficos y métricas clave
 * - Diseño Adventure premium
 */
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido al centro de control de L.A.M.A. Medellín
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="hidden sm:inline">Sistema operativo</span>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KPICard
            icon={Users}
            title="Miembros Activos"
            value="248"
            change="+12%"
            changeType="positive"
            subtitle="vs mes anterior"
          />
          
          <KPICard
            icon={Calendar}
            title="Eventos Programados"
            value="8"
            change="+2"
            changeType="positive"
            subtitle="próximos 30 días"
          />
          
          <KPICard
            icon={DollarSign}
            title="Recaudo Mensual"
            value="$4.2M"
            change="+8%"
            changeType="positive"
            subtitle="vs mes anterior"
          />
          
          <KPICard
            icon={FileText}
            title="Inscripciones Pendientes"
            value="15"
            change="-3"
            changeType="negative"
            subtitle="requieren revisión"
          />
        </div>

        {/* Secciones de acceso rápido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <QuickActionCard
            title="Gestión de Miembros"
            description="Administra miembros, roles y permisos"
            actions={[
              { label: "Ver todos", href: "/admin/miembros" },
              { label: "Agregar nuevo", href: "/admin/miembros/nuevo" },
            ]}
          />
          
          <QuickActionCard
            title="Gestión de Eventos"
            description="Crea y administra eventos y rodadas"
            actions={[
              { label: "Ver calendario", href: "/admin/eventos" },
              { label: "Crear evento", href: "/admin/eventos/nuevo" },
            ]}
          />
        </div>

        {/* Actividad reciente */}
        <RecentActivityCard />
      </div>
    </div>
  );
}

/**
 * KPICard - Tarjeta de KPI con animaciones
 */
interface KPICardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  subtitle: string;
}

function KPICard({ icon: Icon, title, value, change, changeType, subtitle }: KPICardProps) {
  const changeColor = {
    positive: "text-green-500",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="card-adventure"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${changeColor[changeType]}`}>
          <TrendingUp className="w-4 h-4" />
          <span>{change}</span>
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {title}
      </h3>
      
      <div className="text-3xl font-bold text-foreground mb-1">
        {value}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {subtitle}
      </p>
    </motion.div>
  );
}

/**
 * QuickActionCard - Tarjeta de acción rápida
 */
interface QuickActionCardProps {
  title: string;
  description: string;
  actions: Array<{ label: string; href: string }>;
}

function QuickActionCard({ title, description, actions }: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-adventure"
    >
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <div className="flex gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {action.label} →
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * RecentActivityCard - Card de actividad reciente
 */
function RecentActivityCard() {
  const activities = [
    { id: 1, type: "member", message: "Juan Pérez se registró como nuevo miembro", time: "Hace 5 min" },
    { id: 2, type: "event", message: "Evento 'Rodada Cafetera' actualizado", time: "Hace 1 hora" },
    { id: 3, type: "donation", message: "Nueva donación de $500.000 recibida", time: "Hace 2 horas" },
    { id: 4, type: "application", message: "3 nuevas solicitudes de inscripción", time: "Hace 3 horas" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-adventure"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Actividad Reciente
      </h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-adventure"
          >
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div className="flex-1">
              <p className="text-sm text-foreground">
                {activity.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
