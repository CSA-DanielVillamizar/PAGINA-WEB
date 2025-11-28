import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal } from 'lucide-react';
import { eventsApi } from '@/lib/api/events.api';
import { RankingEntry } from '@/lib/types/event.types';

/**
 * Ranking de Asistencia L.A.M.A. Medellín
 * Sistema de puntos, medallas y kilometraje acumulado
 */
export default function RankingAsistenciaPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadRanking();
  }, [selectedYear]);

  const loadRanking = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getRanking(selectedYear);
      setRanking(data);
    } catch (error) {
      console.error('Error cargando ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (medalla: string) => {
    if (medalla.includes('Hierro')) return '🏆';
    if (medalla.includes('Oro')) return '🥇';
    if (medalla.includes('Plata')) return '🥈';
    if (medalla.includes('Bronce')) return '🥉';
    return '—';
  };

  const getPositionBadgeColor = (posicion: number) => {
    if (posicion === 1) return 'bg-primary';
    if (posicion === 2) return 'bg-gray-400';
    if (posicion === 3) return 'bg-orange-600';
    return 'bg-secondary';
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Header Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container-adventure py-12 text-center"
      >
        <Trophy className="w-20 h-20 text-primary mx-auto animate-pulse mb-4" />
        <h1 className="text-5xl font-bold mb-4">
          Ranking de <span className="text-primary">Riders</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
          Sistema oficial de puntuación por asistencia a eventos
        </p>
        <p className="text-primary font-semibold">
          🏍 Cada kilómetro cuenta. Cada evento nos fortalece. 💛
        </p>
      </motion.div>

      <div className="container-adventure py-8">
        {/* Selector de año */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <label className="text-gray-400 font-semibold">Año:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-secondary border-border rounded-lg"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Reglas de puntuación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-adventure p-6 mb-8 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Reglas Oficiales de Puntuación
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Rodadas & Aniversarios:</p>
              <p className="font-bold text-primary">1 punto</p>
            </div>
            <div>
              <p className="text-gray-400">Eventos Sociales:</p>
              <p className="font-bold text-primary">2 puntos</p>
            </div>
            <div>
              <p className="text-gray-400">Rally Regional:</p>
              <p className="font-bold text-primary">3 puntos</p>
            </div>
            <div>
              <p className="text-gray-400">Rally Nacional:</p>
              <p className="font-bold text-primary">5 puntos</p>
            </div>
            <div>
              <p className="text-gray-400">Rally Sudamericano & Ruta Icónica:</p>
              <p className="font-bold text-primary">10 puntos</p>
            </div>
            <div>
              <p className="text-gray-400">Rally Internacional:</p>
              <p className="font-bold text-primary">15 puntos</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/30">
            <p className="text-xs text-gray-400">
              ⚠ En caso de empate en puntos, se desempata por <strong>kilometraje total acumulado</strong>.
            </p>
          </div>
        </motion.div>

        {/* Sistema de Medallas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-adventure p-6 mb-8 border-border"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Medal className="w-6 h-6 text-primary" />
            Sistema de Medallas
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
              <p className="text-4xl mb-2">🥉</p>
              <p className="font-bold">Bronce</p>
              <p className="text-sm text-gray-400">5+ puntos</p>
            </div>
            <div className="text-center p-4 bg-gray-700/20 border border-gray-400/30 rounded-lg">
              <p className="text-4xl mb-2">🥈</p>
              <p className="font-bold">Plata</p>
              <p className="text-sm text-gray-400">15+ puntos</p>
            </div>
            <div className="text-center p-4 bg-yellow-900/20 border border-primary/30 rounded-lg">
              <p className="text-4xl mb-2">🥇</p>
              <p className="font-bold">Oro</p>
              <p className="text-sm text-gray-400">30+ puntos</p>
            </div>
            <div className="text-center p-4 bg-primary/10 border border-primary/50 rounded-lg animate-pulse">
              <p className="text-4xl mb-2">🏆</p>
              <p className="font-bold text-primary">Rider de Hierro</p>
              <p className="text-sm text-gray-400">50+ puntos</p>
            </div>
          </div>
        </motion.div>

        {/* Tabla de Ranking */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-400">Cargando ranking...</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-12 card-adventure border-border">
            <Trophy className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No hay datos para este año</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-adventure overflow-hidden border-border"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Rider</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Eventos</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Puntos</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Km Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">Medalla</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((entry, index) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-border hover:bg-secondary/30 transition-adventure ${
                        entry.posicion <= 3 ? 'bg-gray-700/30' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div
                          className={`w-10 h-10 ${getPositionBadgeColor(
                            entry.posicion
                          )} rounded-full flex items-center justify-center font-bold text-white`}
                        >
                          {entry.posicion}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold">{entry.nombre}</p>
                          <p className="text-sm text-gray-400">{entry.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                          {entry.totalEventos}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-2xl font-bold text-primary">{entry.totalPuntos}</span>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-300">
                        {entry.totalKilometros.toLocaleString()} km
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl">{getMedalIcon(entry.medalla)}</span>
                          <span className="font-semibold" style={{ color: entry.colorMedalla }}>
                            {entry.medalla}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Footer inspiracional */}
        <div className="text-center mt-12 py-8 border-t border-border">
          <p className="text-gray-400 text-lg mb-2">
            Somos más que una ruta. Somos un legado en movimiento.
          </p>
          <p className="text-primary font-bold">Fundación L.A.M.A. Medellín</p>
        </div>
      </div>
    </div>
  );
}
