import { 
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, 
  ValidationPipe, ParseIntPipe, DefaultValuePipe 
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { EventType, EventStatus } from './entities/event.entity';

/**
 * Controller de eventos
 * Rutas públicas (GET) y protegidas (POST/PUT/DELETE - solo Junta)
 */
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Listar todos los eventos con filtros
   * Público - cualquiera puede ver eventos
   */
  @Get()
  async findAll(
    @Query('tipo') tipo?: EventType,
    @Query('estado') estado?: EventStatus,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.eventsService.findAll({ tipo, estado, desde, hasta });
  }

  /**
   * Obtener evento por slug (para URLs amigables)
   * Público
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  /**
   * Obtener evento por ID
   * Público
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  /**
   * Crear nuevo evento
   * Solo Presidente, Vicepresidente, Secretario, Tesorero, MTO, Negocios, Admin
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Presidente', 'Vicepresidente', 'Secretario', 'Tesorero', 'MTO', 'Negocios', 'Admin')
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createEventDto: CreateEventDto
  ) {
    return this.eventsService.create(createEventDto);
  }

  /**
   * Actualizar evento existente
   * Solo roles de Junta + MTO + Negocios
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Presidente', 'Vicepresidente', 'Secretario', 'Tesorero', 'MTO', 'Negocios', 'Admin')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  /**
   * Eliminar evento
   * Solo Presidente, Vicepresidente y Admin
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Presidente', 'Vicepresidente', 'Admin')
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
    return { message: 'Evento eliminado exitosamente' };
  }

  /**
   * Inscribirse a un evento
   * Requiere autenticación - solo miembros del capítulo
   */
  @Post(':id/inscribirse')
  @UseGuards(JwtAuthGuard)
  async registerToEvent(
    @Param('id') eventId: string,
    @CurrentUser() user: any,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) registerDto: RegisterEventDto
  ) {
    return this.eventsService.registerParticipant(eventId, user.id, registerDto);
  }

  /**
   * Cancelar inscripción a un evento
   * Requiere autenticación
   */
  @Delete(':id/cancelar-inscripcion')
  @UseGuards(JwtAuthGuard)
  async cancelRegistration(
    @Param('id') eventId: string,
    @CurrentUser() user: any
  ) {
    await this.eventsService.cancelRegistration(eventId, user.id);
    return { message: 'Inscripción cancelada exitosamente' };
  }

  /**
   * Verificar si usuario está inscrito
   * Requiere autenticación
   */
  @Get(':id/mi-inscripcion')
  @UseGuards(JwtAuthGuard)
  async checkMyRegistration(
    @Param('id') eventId: string,
    @CurrentUser() user: any
  ) {
    const isRegistered = await this.eventsService.isUserRegistered(eventId, user.id);
    return { isRegistered };
  }

  /**
   * Obtener participantes de un evento
   * Público (pero con info limitada) o completo para admin
   */
  @Get(':id/participantes')
  async getParticipants(@Param('id') eventId: string) {
    return this.eventsService.getEventParticipants(eventId);
  }

  /**
   * Obtener estadísticas de un evento
   * Público
   */
  @Get(':id/stats')
  async getEventStats(@Param('id') eventId: string) {
    return this.eventsService.getEventStats(eventId);
  }

  /**
   * Actualizar estado de participación
   * Solo roles de Junta - para marcar asistencia
   */
  @Put('participantes/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Presidente', 'Vicepresidente', 'Secretario', 'Tesorero', 'MTO', 'Admin')
  async updateParticipantStatus(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateDto: UpdateParticipantStatusDto
  ) {
    return this.eventsService.updateParticipantStatus(updateDto);
  }

  /**
   * Ranking de asistencia anual
   * Público - celebramos a nuestros riders más activos
   */
  @Get('ranking/asistencia')
  async getRanking(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number
  ) {
    return this.eventsService.getRankingAnual(year);
  }

  /**
   * Estadísticas individuales de un miembro
   * Requiere autenticación
   */
  @Get('ranking/mis-estadisticas')
  @UseGuards(JwtAuthGuard)
  async getMyStats(
    @CurrentUser() user: any,
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year: number
  ) {
    return this.eventsService.getMemberStats(user.id, year);
  }
}
