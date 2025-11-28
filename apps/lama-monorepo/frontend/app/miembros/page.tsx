'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

interface Member {
  id: string;
  cargoJunta?: string;
  tipoMiembro: string;
  profesion?: string;
  serviciosOfrecidos?: string;
  fotoPerfil?: string;
  user: {
    nombreCompleto: string;
    correo: string;
  };
}

export default function MiembrosPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/members').then((res) => {
      setMembers(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Miembros del Capítulo</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              {m.fotoPerfil && (
                <img src={m.fotoPerfil} alt={m.user.nombreCompleto} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
              )}
              <h2 className="text-xl font-semibold text-center">{m.user.nombreCompleto}</h2>
              {m.cargoJunta && <p className="text-center text-blue-600 font-medium">{m.cargoJunta}</p>}
              <p className="text-center text-gray-600">{m.tipoMiembro}</p>
              {m.profesion && <p className="text-sm text-gray-500 text-center mt-2">{m.profesion}</p>}
              {m.serviciosOfrecidos && (
                <p className="text-sm text-gray-700 mt-2 text-center italic">Servicios: {m.serviciosOfrecidos}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
