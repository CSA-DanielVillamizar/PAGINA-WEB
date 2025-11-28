import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi } from '@/lib/api/events.api';
import { Event, EventStatus } from '@/lib/types/event.types';

/**
 * Página principal de eventos con calendario
 * Vista mensual + vista lista
 */
export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const data = await eventsApi.getAll({
        desde: start.toISOString(),
        hasta: end.toISOString(),
        estado: EventStatus.PUBLICADO
      });
      
      setEvents(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      RODADA: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
      ASAMBLEA: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
      ANIVERSARIO: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
      RALLY_NACIONAL: 'bg-red-500/20 text-red-200 border-red-500/30',
      RALLY_REGIONAL: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
      RALLY_SUDAMERICANO: 'bg-green-500/20 text-green-200 border-green-500/30',
      RALLY_INTERNACIONAL: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
      LAMA_HIERRO: 'bg-gray-500/20 text-gray-200 border-gray-500/30',
      EVENTO_SOCIAL: 'bg-pink-500/20 text-pink-200 border-pink-500/30',
      RUTA_ICONICA: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
    };
    return colors[tipo] || 'bg-gray-500/20 text-gray-200 border-gray-500/30';
  };

  const getEventTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      RODADA: 'Rodada',
      ASAMBLEA: 'Asamblea',
      ANIVERSARIO: 'Aniversario',
      RALLY_NACIONAL: 'Rally Nacional',
      RALLY_REGIONAL: 'Rally Regional',
      RALLY_SUDAMERICANO: 'Rally Sudamericano',
      RALLY_INTERNACIONAL: 'Rally Internacional',
      LAMA_HIERRO: 'L.A.M.A. de Hierro',
      EVENTO_SOCIAL: 'Evento Social',
      RUTA_ICONICA: 'Ruta Icónica',
    };
    return labels[tipo] || tipo;
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const firstDayOfWeek = startOfMonth(currentDate).getDay();
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.fechaInicio), day)
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-yellow-500/20"
      >
        <div className="container-adventure py-12">
          <h1 className="text-5xl font-bold mb-4">
            Calendario de <span className="text-primary">Eventos</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Rodadas, rallys, asambleas y más. Únete a nuestra comunidad en cada aventura.
          </p>
          <p className="text-primary mt-2 font-medium">
            🏍 Somos más que una ruta. Somos un legado en movimiento. 💛
          </p>
        </div>
      </motion.div>

      <div className="container-adventure py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          {/* Month navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg bg-secondary hover:bg-gray-700 transition-adventure"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold capitalize min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-secondary hover:bg-gray-700 transition-adventure"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-adventure ${
                viewMode === 'calendar'
                  ? 'bg-primary text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-adventure ${
                viewMode === 'list'
                  ? 'bg-primary text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-400">Cargando eventos...</p>
          </div>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              /* Calendar View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-adventure overflow-hidden border-border"
              >
                {/* Week days header */}
                <div className="grid grid-cols-7 bg-gray-900 border-b border-border">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div
                      key={day}
                      className="p-4 text-center font-semibold text-gray-400 uppercase text-sm"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {/* Empty days */}
                  {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="border border-border h-32 bg-gray-900/50" />
                  ))}

                  {/* Days with events */}
                  {daysInMonth.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className={`border border-border h-32 p-2 hover:bg-gray-700/30 transition-adventure ${
                          isToday ? 'bg-primary/10 border-primary/50' : ''
                        }`}
                      >
                        <div className="flex flex-col h-full">
                          <div
                            className={`text-sm font-semibold mb-1 ${
                              isToday ? 'text-primary' : 'text-gray-400'
                            }`}
                          >
                            {format(day, 'd')}
                          </div>
                          <div className="flex-1 overflow-y-auto space-y-1">
                            {dayEvents.map((event) => (
                              <Link
                                key={event.id}
                                to={`/eventos/${event.slug}`}
                                className={`block text-xs px-2 py-1 rounded border ${getEventTypeColor(
                                  event.tipoActividad
                                )} hover:opacity-80 transition-adventure truncate`}
                              >
                                {event.titulo}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* List View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {events.length === 0 ? (
                  <div className="text-center py-12 card-adventure border-border">
                    <CalendarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No hay eventos programados este mes</p>
                  </div>
                ) : (
                  events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={`/eventos/${event.slug}`}
                        className="block card-adventure p-6 border-border hover:border-primary/50 hover:bg-gray-750 transition-adventure group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEventTypeColor(
                                  event.tipoActividad
                                )}`}
                              >
                                {getEventTypeLabel(event.tipoActividad)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {format(parseISO(event.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-adventure">
                              {event.titulo}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-400 flex-wrap">
                              <MapPin className="w-4 h-4" />
                              <span>{event.destino}</span>
                              {event.kilometraje > 0 && (
                                <span className="ml-2 text-primary">• {event.kilometraje} km</span>
                              )}
                            </div>
                          </div>
                          {event.imagenUrl && (
                            <img
                              src={event.imagenUrl}
                              alt={event.titulo}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
