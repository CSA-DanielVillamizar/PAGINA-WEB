import React from "react";
import Link from "next/link";

/**
 * Barra lateral de navegación para el panel de administración.
 * Incluye enlaces a las secciones principales de gestión.
 */
export const AdminSidebar: React.FC = () => (
  <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 min-h-screen p-4">
    <nav className="flex flex-col gap-2">
      <Link href="/admin" className="font-bold text-lg mb-4">Panel Admin</Link>
      <Link href="/admin/miembros">Miembros</Link>
      <Link href="/admin/vehiculos">Vehículos</Link>
      <Link href="/admin/eventos">Eventos</Link>
      <Link href="/admin/souvenirs">Souvenirs</Link>
      <Link href="/admin/noticias">Noticias</Link>
      <Link href="/admin/suscripciones">Suscripciones</Link>
      <Link href="/admin/donaciones">Donaciones</Link>
      <Link href="/admin/inscripciones">Inscripciones</Link>
      <Link href="/admin/usuarios">Usuarios</Link>
    </nav>
  </aside>
);
