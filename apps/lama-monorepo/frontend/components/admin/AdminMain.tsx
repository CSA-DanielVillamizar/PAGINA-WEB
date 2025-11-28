import React from "react";

/**
 * Área principal del panel de administración.
 * Aquí se mostrarán los dashboards, tablas y widgets de gestión.
 */
export const AdminMain: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bienvenido al Panel de Administración</h1>
      <p className="mb-2">Selecciona una sección en la barra lateral para gestionar los recursos.</p>
      {/* Aquí se pueden agregar widgets, KPIs, gráficos, etc. */}
    </div>
  );
};
