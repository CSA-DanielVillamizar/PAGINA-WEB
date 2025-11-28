/**
 * Tipos TypeScript para el sistema de eventos L.A.M.A. Medellín
 */

export enum EventType {
  RODADA = 'RODADA',
  ASAMBLEA = 'ASAMBLEA',
  ANIVERSARIO = 'ANIVERSARIO',
  RALLY_NACIONAL = 'RALLY_NACIONAL',
  RALLY_REGIONAL = 'RALLY_REGIONAL',
  RALLY_SUDAMERICANO = 'RALLY_SUDAMERICANO',
  RALLY_INTERNACIONAL = 'RALLY_INTERNACIONAL',
  LAMA_HIERRO = 'LAMA_HIERRO',
  EVENTO_SOCIAL = 'EVENTO_SOCIAL',
  RUTA_ICONICA = 'RUTA_ICONICA',
  OTRO = 'OTRO'
}

export enum EventDifficulty {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA'
}

export enum EventStatus {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO',
  CANCELADO = 'CANCELADO',
  FINALIZADO = 'FINALIZADO'
}

export enum ParticipantStatus {
  REGISTRADO = 'REGISTRADO',
  CONFIRMADO = 'CONFIRMADO',
  ASISTIO = 'ASISTIO',
  NO_ASISTIO = 'NO_ASISTIO'
}

export interface Event {
  id: string;
  titulo: string;
  slug: string;
  descripcionLarga: string;
  fechaInicio: string;
  fechaFin?: string;
  horaEncuentro?: string;
  horaSalida?: string;
  destino: string;
  puntoEncuentro?: string;
  tipoActividad: EventType;
  dificultad: EventDifficulty;
  duracionHoras: number;
  organizador: string;
  kilometraje: number;
  linkTerminos?: string;
  estado: EventStatus;
  imagenUrl?: string;
  participantes?: EventParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  fechaRegistro: string;
  fuente: string;
  estado: ParticipantStatus;
  notas?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface RankingEntry {
  posicion: number;
  userId: string;
  nombre: string;
  email: string;
  totalEventos: number;
  totalPuntos: number;
  totalKilometros: number;
  medalla: string;
  colorMedalla: string;
  eventos: Array<{
    titulo: string;
    tipo: EventType;
    fecha: string;
    puntos: number;
    kilometraje: number;
  }>;
}

export interface MemberStats {
  year: number;
  totalEventos: number;
  totalPuntos: number;
  totalKilometros: number;
  medalla: string;
  colorMedalla: string;
  eventosPorTipo: Record<string, number>;
  ultimosEventos: Array<{
    titulo: string;
    fecha: string;
    tipo: EventType;
    kilometraje: number;
  }>;
}

export interface EventStats {
  totalRegistrados: number;
  confirmados: number;
  asistieron: number;
  noAsistieron: number;
}
