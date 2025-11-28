import apiClient from '@/services/api';
import type { 
  Event, 
  EventType, 
  EventStatus, 
  EventParticipant, 
  RankingEntry, 
  MemberStats, 
  EventStats 
} from '../types/event.types';

/**
 * Cliente API para eventos L.A.M.A. Medellín
 * Todas las operaciones CRUD + inscripciones + ranking
 */

export const eventsApi = {
  /**
   * Listar eventos con filtros opcionales
   */
  async getAll(filters?: {
    tipo?: EventType;
    estado?: EventStatus;
    desde?: string;
    hasta?: string;
  }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.desde) params.append('desde', filters.desde);
    if (filters?.hasta) params.append('hasta', filters.hasta);

    const { data } = await apiClient.get<Event[]>(`/events?${params.toString()}`);
    return data;
  },

  /**
   * Obtener evento por slug (para URLs amigables)
   */
  async getBySlug(slug: string): Promise<Event> {
    const { data } = await apiClient.get<Event>(`/events/slug/${slug}`);
    return data;
  },

  /**
   * Obtener evento por ID
   */
  async getById(id: string): Promise<Event> {
    const { data } = await apiClient.get<Event>(`/events/${id}`);
    return data;
  },

  /**
   * Crear nuevo evento (solo admin/junta)
   */
  async create(eventData: Partial<Event>): Promise<Event> {
    const { data } = await apiClient.post<Event>('/events', eventData);
    return data;
  },

  /**
   * Actualizar evento (solo admin/junta)
   */
  async update(id: string, eventData: Partial<Event>): Promise<Event> {
    const { data } = await apiClient.put<Event>(`/events/${id}`, eventData);
    return data;
  },

  /**
   * Eliminar evento (solo admin)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  /**
   * Inscribirse a un evento
   */
  async register(eventId: string, registerData?: { notas?: string }): Promise<EventParticipant> {
    const { data } = await apiClient.post<EventParticipant>(
      `/events/${eventId}/inscribirse`,
      registerData || {}
    );
    return data;
  },

  /**
   * Cancelar inscripción
   */
  async cancelRegistration(eventId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/cancelar-inscripcion`);
  },

  /**
   * Verificar si estoy inscrito
   */
  async checkMyRegistration(eventId: string): Promise<{ isRegistered: boolean }> {
    const { data } = await apiClient.get<{ isRegistered: boolean }>(
      `/events/${eventId}/mi-inscripcion`
    );
    return data;
  },

  /**
   * Obtener participantes de un evento
   */
  async getParticipants(eventId: string): Promise<EventParticipant[]> {
    const { data } = await apiClient.get<EventParticipant[]>(`/events/${eventId}/participantes`);
    return data;
  },

  /**
   * Obtener estadísticas de un evento
   */
  async getEventStats(eventId: string): Promise<EventStats> {
    const { data} = await apiClient.get<EventStats>(`/events/${eventId}/stats`);
    return data;
  },

  /**
   * Actualizar estado de participación (solo admin)
   */
  async updateParticipantStatus(participantId: string, estado: string): Promise<EventParticipant> {
    const { data } = await apiClient.put<EventParticipant>('/events/participantes/estado', {
      participantId,
      estado
    });
    return data;
  },

  /**
   * Obtener ranking de asistencia anual
   */
  async getRanking(year?: number): Promise<RankingEntry[]> {
    const params = year ? `?year=${year}` : '';
    const { data } = await apiClient.get<RankingEntry[]>(`/events/ranking/asistencia${params}`);
    return data;
  },

  /**
   * Obtener mis estadísticas personales
   */
  async getMyStats(year?: number): Promise<MemberStats> {
    const params = year ? `?year=${year}` : '';
    const { data } = await apiClient.get<MemberStats>(`/events/ranking/mis-estadisticas${params}`);
    return data;
  }
};

export default eventsApi;
