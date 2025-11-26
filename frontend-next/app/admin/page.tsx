"use client";
export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import RequireAuth from '../../components/auth/RequireAuth';
import { useAuth } from '../../components/auth/AuthProvider';

function AdminInner() {
  const { user, logout } = useAuth();
  return (
    <RequireAuth>
      <main className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Panel administrativo</h1>
          <button className="border px-3 py-1 rounded" onClick={logout}>Salir</button>
        </div>
        <p className="mt-2 text-sm opacity-80">Bienvenido{user?.nombreCompleto ? `, ${user.nombreCompleto}` : ''}.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <a className="border rounded p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800" href="#">Miembros</a>
          <a className="border rounded p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800" href="#">Vehículos</a>
          <a className="border rounded p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800" href="#">Eventos</a>
          <a className="border rounded p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800" href="#">Donaciones</a>
        </div>
      </main>
    </RequireAuth>
  );
}

export default function AdminHome() {
  return (
    <Suspense fallback={<div className="p-6">Cargando…</div>}>
      <AdminInner />
    </Suspense>
  );
}
