import React from "react";

/**
 * Tabla de administración de inscripciones.
 * Permite ver, editar y eliminar inscripciones registradas.
 */
export const InscripcionesAdminTable: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestión de Inscripciones</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Fecha</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Aquí se mapearán las inscripciones */}
            <tr>
              <td className="px-4 py-2 border-b">1</td>
              <td className="px-4 py-2 border-b">Carlos Ruiz</td>
              <td className="px-4 py-2 border-b">2025-11-10</td>
              <td className="px-4 py-2 border-b">Pendiente</td>
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
