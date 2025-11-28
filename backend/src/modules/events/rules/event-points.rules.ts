import { EventType } from '../entities/event.entity';

/**
 * Reglas oficiales de puntuación de la Fundación L.A.M.A. Medellín
 * Puntos por tipo de actividad según reglamento interno
 */
export class EventPointsRules {
  private static readonly POINTS_MAP: Record<EventType, number> = {
    [EventType.RODADA]: 1,
    [EventType.ANIVERSARIO]: 1,
    [EventType.EVENTO_SOCIAL]: 2,
    [EventType.RALLY_REGIONAL]: 3,
    [EventType.RALLY_NACIONAL]: 5,
    [EventType.RALLY_SUDAMERICANO]: 10,
    [EventType.RUTA_ICONICA]: 10,
    [EventType.RALLY_INTERNACIONAL]: 15,
    [EventType.LAMA_HIERRO]: 10,
    [EventType.ASAMBLEA]: 0, // Obligatoria pero no suma puntos deportivos
    [EventType.OTRO]: 0
  };

  /**
   * Obtener puntos por tipo de actividad
   */
  static getPoints(tipo: EventType): number {
    return this.POINTS_MAP[tipo] || 0;
  }

  /**
   * Calcular medalla según puntos acumulados
   */
  static getMedal(totalPuntos: number): string {
    if (totalPuntos >= 50) return '🏆 Rider de Hierro';
    if (totalPuntos >= 30) return '🥇 Oro';
    if (totalPuntos >= 15) return '🥈 Plata';
    if (totalPuntos >= 5) return '🥉 Bronce';
    return '—';
  }

  /**
   * Obtener color de medalla para UI
   */
  static getMedalColor(totalPuntos: number): string {
    if (totalPuntos >= 50) return '#FFD700'; // Dorado especial
    if (totalPuntos >= 30) return '#FFD700'; // Oro
    if (totalPuntos >= 15) return '#C0C0C0'; // Plata
    if (totalPuntos >= 5) return '#CD7F32'; // Bronce
    return '#6B7280'; // Gris
  }
}
