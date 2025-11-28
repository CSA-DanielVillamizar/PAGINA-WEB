'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api';

interface News {
  id: string;
  titulo: string;
  resumen?: string;
  imagenUrl?: string;
  fechaPublicacion: string;
}

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/news').then((res) => {
      setNews(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Noticias</h1>
        <div className="space-y-6">
          {news.map((n) => (
            <Link key={n.id} href={`/noticias/${n.id}`} className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex gap-6">
                {n.imagenUrl && (
                  <img src={n.imagenUrl} alt={n.titulo} className="w-48 h-32 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">{n.titulo}</h2>
                  {n.resumen && <p className="text-gray-700 mb-2">{n.resumen}</p>}
                  <p className="text-sm text-gray-500">{new Date(n.fechaPublicacion).toLocaleDateString('es-CO')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
