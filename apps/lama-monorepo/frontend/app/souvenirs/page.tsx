'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

interface Souvenir {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
  inventario: number;
  categoria: string;
}

export default function SouvenirsPage() {
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/souvenirs').then((res) => {
      setSouvenirs(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Souvenirs L.A.M.A.</h1>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {souvenirs.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              {s.imagenUrl && (
                <img src={s.imagenUrl} alt={s.nombre} className="w-full h-48 object-cover rounded mb-4" />
              )}
              <h3 className="font-semibold text-lg">{s.nombre}</h3>
              <p className="text-sm text-gray-600">{s.categoria}</p>
              {s.descripcion && <p className="text-sm text-gray-700 mt-2">{s.descripcion}</p>}
              <p className="text-xl font-bold text-blue-600 mt-3">${s.precio}</p>
              <p className="text-xs text-gray-500">Stock: {s.inventario}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
