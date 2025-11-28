import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual } from 'typeorm';
import { Event, EventStatus, EventType } from './entities/event.entity';
import { EventParticipant, ParticipantStatus, RegistrationSource } from './entities/event-participant.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';
import { EventPointsRules } from './rules/event-points.rules';

/**
 * Service de eventos y participación
 * Sistema completo L.A.M.A. Medellín: CRUD eventos, inscripciones, ranking, puntos
 */
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventParticipant)
    private readonly participantRepository: Repository<EventParticipant>,
  ) {}

  /**
   * Crear nuevo evento (solo admin/junta)
   */
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const existingEvent = await this.eventRepository.findOne({
      where: { slug: createEventDto.slug }
    });

    if (existingEvent) {
      throw new BadRequestException(`El slug "${createEventDto.slug}" ya está en uso`);
    }

    const event = this.eventRepository.create(createEventDto);
    return await this.eventRepository.save(event);
  }

  /**
   * Listar eventos con filtros
   */
  async findAll(filters?: {
    tipo?: EventType;
    estado?: EventStatus;
    desde?: string;
    hasta?: string;
  }): Promise<Event[]> {
    const where: any = {};

    if (filters?.tipo) {
      where.tipoActividad = filters.tipo;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.desde && filters?.hasta) {
      where.fechaInicio = Between(new Date(filters.desde), new Date(filters.hasta));
    } else if (filters?.desde) {
      where.fechaInicio = MoreThanOrEqual(new Date(filters.desde));
    }

    return await this.eventRepository.find({
      where,
      order: { fechaInicio: 'ASC' },
      relations: ['participantes', 'participantes.user']
    });
  }

  /**
   * Obtener evento por ID
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['participantes', 'participantes.user']
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return event;
  }

  /**
   * Obtener evento por slug
   */
  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { slug },
      relations: ['participantes', 'participantes.user']
    });

    if (!event) {
      throw new NotFoundException(`Evento con slug "${slug}" no encontrado`);
    }

    return event;
  }

  /**
   * Actualizar evento (solo admin/junta)
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    if (updateEventDto.slug && updateEventDto.slug !== event.slug) {
      const existingEvent = await this.eventRepository.findOne({
        where: { slug: updateEventDto.slug }
      });

      if (existingEvent) {
        throw new BadRequestException(`El slug "${updateEventDto.slug}" ya está en uso`);
      }
    }

    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  /**
   * Eliminar evento (solo admin/junta)
   */
  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  /**
   * Inscribir miembro a evento
   */
  async registerParticipant(
    eventId: string,
    userId: string,
    registerDto: RegisterEventDto
  ): Promise<EventParticipant> {
    const event = await this.findOne(eventId);

    if (event.estado !== EventStatus.PUBLICADO) {
      throw new BadRequestException('Este evento no está disponible para inscripciones');
    }

    if (new Date(event.fechaInicio) < new Date()) {
      throw new BadRequestException('No puedes inscribirte a un evento que ya inició');
    }

    const existingParticipant = await this.participantRepository.findOne({
      where: { eventId, userId }
    });

    if (existingParticipant) {
      throw new BadRequestException('Ya estás inscrito en este evento');
    }

    const participant = this.participantRepository.create({
      eventId,
      userId,
      fuente: registerDto.fuente || RegistrationSource.WEB,
      notas: registerDto.notas,
      estado: ParticipantStatus.REGISTRADO
    });

    return await this.participantRepository.save(participant);
  }

  /**
   * Cancelar inscripción
   */
  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { eventId, userId }
    });

    if (!participant) {
      throw new NotFoundException('No estás inscrito en este evento');
    }

    await this.participantRepository.remove(participant);
  }

  /**
   * Actualizar estado de participación (solo admin)
   */
  async updateParticipantStatus(updateDto: UpdateParticipantStatusDto): Promise<EventParticipant> {
    const participant = await this.participantRepository.findOne({
      where: { id: updateDto.participantId },
      relations: ['event', 'user']
    });

    if (!participant) {
      throw new NotFoundException(`Participante ${updateDto.participantId} no encontrado`);
    }

    participant.estado = updateDto.estado;
    return await this.participantRepository.save(participant);
  }

  /**
   * Obtener participantes de un evento
   */
  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    return await this.participantRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { fechaRegistro: 'DESC' }
    });
  }

  /**
   * Verificar si un usuario está inscrito
   */
  async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    const count = await this.participantRepository.count({
      where: { eventId, userId }
    });
    return count > 0;
  }

  /**
   * Obtener estadísticas de un evento
   */
  async getEventStats(eventId: string) {
    const participants = await this.participantRepository.find({
      where: { eventId }
    });

    return {
      totalRegistrados: participants.length,
      confirmados: participants.filter(p => p.estado === ParticipantStatus.CONFIRMADO).length,
      asistieron: participants.filter(p => p.estado === ParticipantStatus.ASISTIO).length,
      noAsistieron: participants.filter(p => p.estado === ParticipantStatus.NO_ASISTIO).length
    };
  }

  /**
   * Ranking de asistencia anual
   * Calcula puntos, eventos y kilometraje por miembro
   */
  async getRankingAnual(year?: number): Promise<any[]> {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const participantes = await this.participantRepository.find({
      where: {
        estado: ParticipantStatus.ASISTIO
      },
      relations: ['event', 'user']
    });

    const participantesYear = participantes.filter(p => {
      const fechaEvento = new Date(p.event.fechaInicio);
      return fechaEvento >= startDate && fechaEvento <= endDate;
    });

    const rankingMap = new Map<string, any>();

    participantesYear.forEach(p => {
      const userId = p.userId;
      
      if (!rankingMap.has(userId)) {
        rankingMap.set(userId, {
          userId,
          nombre: p.user.nombreCompleto,
          email: p.user.correo,
          totalEventos: 0,
          totalPuntos: 0,
          totalKilometros: 0,
          eventos: []
        });
      }

      const userStats = rankingMap.get(userId);
      const puntos = EventPointsRules.getPoints(p.event.tipoActividad);

      userStats.totalEventos++;
      userStats.totalPuntos += puntos;
      userStats.totalKilometros += p.event.kilometraje;
      userStats.eventos.push({
        titulo: p.event.titulo,
        tipo: p.event.tipoActividad,
        fecha: p.event.fechaInicio,
        puntos,
        kilometraje: p.event.kilometraje
      });
    });

    const ranking = Array.from(rankingMap.values())
      .sort((a, b) => {
        if (b.totalPuntos !== a.totalPuntos) {
          return b.totalPuntos - a.totalPuntos;
        }
        return b.totalKilometros - a.totalKilometros;
      })
      .map((item, index) => ({
        posicion: index + 1,
        ...item,
        medalla: EventPointsRules.getMedal(item.totalPuntos),
        colorMedalla: EventPointsRules.getMedalColor(item.totalPuntos)
      }));

    return ranking;
  }

  /**
   * Estadísticas de un miembro específico
   */
  async getMemberStats(userId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const participaciones = await this.participantRepository.find({
      where: {
        userId,
        estado: ParticipantStatus.ASISTIO
      },
      relations: ['event']
    });

    const participacionesYear = participaciones.filter(p => {
      const fechaEvento = new Date(p.event.fechaInicio);
      return fechaEvento >= startDate && fechaEvento <= endDate;
    });

    let totalPuntos = 0;
    let totalKilometros = 0;
    const eventosPorTipo: Record<string, number> = {};

    participacionesYear.forEach(p => {
      totalPuntos += EventPointsRules.getPoints(p.event.tipoActividad);
      totalKilometros += p.event.kilometraje;
      
      const tipo = p.event.tipoActividad;
      eventosPorTipo[tipo] = (eventosPorTipo[tipo] || 0) + 1;
    });

    return {
      year: targetYear,
      totalEventos: participacionesYear.length,
      totalPuntos,
      totalKilometros,
      medalla: EventPointsRules.getMedal(totalPuntos),
      colorMedalla: EventPointsRules.getMedalColor(totalPuntos),
      eventosPorTipo,
      ultimosEventos: participacionesYear
        .slice(0, 5)
        .map(p => ({
          titulo: p.event.titulo,
          fecha: p.event.fechaInicio,
          tipo: p.event.tipoActividad,
          kilometraje: p.event.kilometraje
        }))
    };
  }
}
