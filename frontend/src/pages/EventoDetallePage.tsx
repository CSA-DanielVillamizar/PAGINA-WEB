import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Route,
  Trophy,
  CheckCircle2,
  X
} from 'lucide-react';
import { eventsApi } from '@/lib/api/events.api';
import { Event } from '@/lib/types/event.types';
import { useAuthStore } from '@/store/auth';

/**
 * Página de detalle de evento con inscripción
 * Muestra toda la información + botones de calendario + inscripción
 */
export default function EventoDetallePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (slug) {
      loadEvent();
    }
  }, [slug]);

  useEffect(() => {
    if (event && isAuthenticated) {
      checkRegistration();
    }
  }, [event, isAuthenticated]);

  const loadEvent = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await eventsApi.getBySlug(slug);
      setEvent(data);
    } catch (error) {
      console.error('Error cargando evento:', error);
      navigate('/eventos');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    if (!event || !isAuthenticated) return;
    try {
      const { isRegistered: registered } = await eventsApi.checkMyRegistration(event.id);
      setIsRegistered(registered);
    } catch (error) {
      console.error('Error verificando inscripción:', error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/eventos/${slug}`);
      return;
    }

    if (!event) return;

    try {
      setRegistering(true);
      await eventsApi.register(event.id);
      setIsRegistered(true);
      alert('✅ Tu asistencia ha sido registrada');
      loadEvent();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event || !confirm('¿Seguro que deseas cancelar tu inscripción?')) return;

    try {
      setRegistering(true);
      await eventsApi.cancelRegistration(event.id);
      setIsRegistered(false);
      alert('Inscripción cancelada');
      loadEvent();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cancelar');
    } finally {
      setRegistering(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    if (!event) return '';
    const startDate = parseISO(event.fechaInicio);
    const title = encodeURIComponent(event.titulo);
    const details = encodeURIComponent(`${event.descripcionLarga}\n\nMás info: ${window.location.href}`);
    const location = encodeURIComponent(event.destino);
    const dates = `${format(startDate, "yyyyMMdd'T'HHmmss")}/${format(startDate, "yyyyMMdd'T'HHmmss")}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  const generateICalFile = () => {
    if (!event) return;
    const startDate = parseISO(event.fechaInicio);
    const ical = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.titulo}
DESCRIPTION:${event.descripcionLarga}
LOCATION:${event.destino}
DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(startDate, "yyyyMMdd'T'HHmmss")}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.slug}.ics`;
    a.click();
  };

  const shareEvent = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    if (!event) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`🏍 ${event.titulo} - ${event.destino}`);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`
    };

    window.open(urls[platform], '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-400">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const eventDate = parseISO(event.fechaInicio);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Hero section con imagen */}
      <div className="relative h-96 bg-gradient-to-b from-secondary to-gray-900">
        {event.imagenUrl && (
          <img
            src={event.imagenUrl}
            alt={event.titulo}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        
        <div className="relative container-adventure h-full flex items-end pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-2 rounded-full bg-primary text-black font-bold text-sm">
                {event.tipoActividad.replace('_', ' ')}
              </span>
              <span className="text-gray-300">
                {format(eventDate, "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{event.titulo}</h1>
            <p className="text-2xl text-primary flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              {event.destino}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-adventure py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descripción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-adventure p-8 border-border"
            >
              <h2 className="text-2xl font-bold mb-4">Descripción</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.descripcionLarga}
              </p>
            </motion.div>

            {/* Detalles del evento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-adventure p-8 border-border"
            >
              <h2 className="text-2xl font-bold mb-6">Detalles del Evento</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Dificultad</p>
                    <p className="text-gray-400">{event.dificultad}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Duración</p>
                    <p className="text-gray-400">{event.duracionHoras} horas</p>
                  </div>
                </div>

                {event.horaEncuentro && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Hora de encuentro</p>
                      <p className="text-gray-400">{event.horaEncuentro}</p>
                    </div>
                  </div>
                )}

                {event.horaSalida && (
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Hora de salida</p>
                      <p className="text-gray-400">{event.horaSalida}</p>
                    </div>
                  </div>
                )}

                {event.puntoEncuentro && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Punto de encuentro</p>
                      <p className="text-gray-400">{event.puntoEncuentro}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Organiza</p>
                    <p className="text-gray-400">{event.organizador}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Route className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Kilometraje</p>
                    <p className="text-gray-400">{event.kilometraje} km</p>
                  </div>
                </div>

                {event.participantes && event.participantes.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold">Participantes registrados</p>
                      <p className="text-gray-400">{event.participantes.length}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Términos y condiciones */}
            {event.linkTerminos && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-primary/10 border border-primary/30 rounded-xl p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold mb-2">Términos y Condiciones</p>
                    <a
                      href={event.linkTerminos}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-yellow-300 flex items-center gap-2 transition-adventure"
                    >
                      Ver términos y condiciones
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar con acciones */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-adventure p-6 border-border sticky top-24"
            >
              {!isPastEvent ? (
                <>
                  {isRegistered ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <p className="text-green-400 font-semibold">Ya estás inscrito</p>
                      </div>
                      <button
                        onClick={handleCancelRegistration}
                        disabled={registering}
                        className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-adventure disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Cancelar inscripción
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="btn-adventure w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {registering ? 'Procesando...' : '🏍 Quiero Participar'}
                    </button>
                  )}
                </>
              ) : (
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <p className="text-gray-400">Este evento ya finalizó</p>
                </div>
              )}

              {/* Agregar a mi calendario */}
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold text-gray-400 mb-2">Agregar a mi calendario:</p>
                <button
                  onClick={() => window.open(generateGoogleCalendarUrl(), '_blank')}
                  className="w-full px-4 py-2 bg-secondary hover:bg-gray-600 rounded-lg text-sm transition-adventure flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Google Calendar
                </button>
                <button
                  onClick={generateICalFile}
                  className="w-full px-4 py-2 bg-secondary hover:bg-gray-600 rounded-lg text-sm transition-adventure flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Outlook / iCal
                </button>
              </div>

              {/* Compartir */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-semibold text-gray-400 mb-3">Compartir evento:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => shareEvent('twitter')}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition-adventure"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => shareEvent('facebook')}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-adventure"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => shareEvent('whatsapp')}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-adventure"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Volver */}
            <Link
              to="/eventos"
              className="block px-6 py-3 card-adventure text-center transition-adventure border-border hover:border-primary/50"
            >
              ← Volver al calendario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
