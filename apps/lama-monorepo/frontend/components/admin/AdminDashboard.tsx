"use client";

import React from "react";
import { motion } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminMain } from "./AdminMain";

/**
 * AdminDashboard - Panel de administración Adventure
 * 
 * Características:
 * - Layout premium con animaciones suaves
 * - Sidebar colapsable
 * - Header con información del usuario
 * - Área de contenido responsive
 * - Diseño institucional Adventure
 */
export const AdminDashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header fijo */}
      <AdminHeader />
      
      {/* Contenedor principal con sidebar y contenido */}
      <div className="flex flex-1">
        <AdminSidebar />
        
        {/* Área de contenido principal */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto scrollbar-adventure"
        >
          <AdminMain />
        </motion.main>
      </div>
    </div>
  );
};
