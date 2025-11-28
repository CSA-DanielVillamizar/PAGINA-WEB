import React from "react";

/**
 * Tabla de administración de eventos.
 * Permite ver, editar y eliminar eventos registrados.
 */
export const EventosAdminTable: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Eventos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Fecha</th>
              <th className="px-4 py-2 border-b">Lugar</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí se mapearán los eventos */}
            <tr>
              <td className="px-4 py-2 border-b">1</td>
              <td className="px-4 py-2 border-b">Rodada Medellín</td>
              <td className="px-4 py-2 border-b">2025-12-01</td>
              <td className="px-4 py-2 border-b">Parque de los Deseos</td>
              <td className="px-4 py-2 border-b">
                <button className="text-blue-600 hover:underline mr-2">Editar</button>
                <button className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
            {/* ...más filas */}
          </tbody>
        </table>
      </div>
    </div>
  );
};
