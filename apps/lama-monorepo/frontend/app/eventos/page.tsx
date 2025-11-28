"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { api } from "../../../services/api";

/**
 * Página pública de eventos con calendario interactivo FullCalendar.
 * Muestra todos los eventos próximos y sancionados de la fundación.
 */
export default function EventosPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Cargar eventos desde la API
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        const eventosFormateados = response.data.data.map((evento: any) => ({
          id: evento.id,
          title: evento.titulo,
          start: evento.fecha,
          description: evento.descripcion,
          extendedProps: {
            tipo: evento.tipoEvento,
            ubicacion: evento.ubicacion,
            estado: evento.estado,
          },
        }));
        setEvents(eventosFormateados);
      } catch (error) {
        console.error("Error cargando eventos:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (info: any) => {
    alert(
      `Evento: ${info.event.title}\nFecha: ${info.event.start.toLocaleDateString(
        "es-CO"
      )}\nTipo: ${info.event.extendedProps.tipo}\nUbicación: ${
        info.event.extendedProps.ubicacion || "No especificado"
      }`
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-neutral-900 dark:text-neutral-50">
          Calendario de Eventos
        </h1>
        <p className="text-center mb-12 text-neutral-600 dark:text-neutral-300">
          Descubre todas las rodadas, asambleas y rallys de la Fundación L.A.M.A. Medellín.
        </p>

        {/* Calendario FullCalendar */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            events={events}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
            }}
            height="auto"
          />
        </div>

        {/* Lista de eventos próximos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-50">
            Próximos Eventos
          </h2>
          <div className="grid gap-4">
            {events
              .filter((e) => new Date(e.start) >= new Date())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 5)
              .map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 border-l-4 border-blue-600"
                >
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    {evento.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    Fecha: {new Date(evento.start).toLocaleDateString("es-CO")} -{" "}
                    {evento.extendedProps.tipo}
                  </p>
                  {evento.extendedProps.ubicacion && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Ubicación: {evento.extendedProps.ubicacion}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
