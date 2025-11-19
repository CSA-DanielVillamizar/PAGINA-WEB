import React, { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import api from '@/services/api'

export default function EventsAdmin() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const { data } = await api.get('/events')
      const calendarEvents = data.map((event: any) => ({
        id: event.id,
        title: event.titulo,
        start: `${event.fecha}T${event.hora}`,
        extendedProps: {
          descripcion: event.descripcion,
          ubicacion: event.ubicacion,
          tipoEvento: event.tipoEvento
        }
      }))
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const handleDateClick = (info: any) => {
    const title = prompt('Ingresa el título del evento:')
    if (title) {
      // Crear nuevo evento
      console.log('Crear evento:', title, info.dateStr)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Eventos</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={events}
          dateClick={handleDateClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          height="auto"
        />
      </div>
    </div>
  )
}
