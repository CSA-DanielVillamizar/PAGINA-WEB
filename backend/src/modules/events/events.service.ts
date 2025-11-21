import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Event } from './event.entity'
import { BlobService } from '../../services/blob.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'

/**
 * Servicio de eventos.
 * Maneja lógica de negocio: paginación, filtrado por fecha/status, inscripciones,
 * recordatorios, carga de imagen de portada y estadísticas.
 */
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private repo: Repository<Event>,
    private blob: BlobService
  ) {}

  /**
   * Listado paginado y filtrado de eventos.
   * Filtros: status (upcoming, past, cancelled), dateFrom, dateTo, search (título/location).
   */
  async findAll(options: {
    page?: number
    pageSize?: number
    status?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }) {
    const page = Math.max(options.page || 1, 1)
    const pageSize = Math.min(Math.max(options.pageSize || 10, 1), 100)

    const qb = this.repo.createQueryBuilder('e').orderBy('e.eventDate', 'DESC')

    if (options.status) qb.andWhere('e.status = :status', { status: options.status })
    if (options.dateFrom) qb.andWhere('e.eventDate >= :dateFrom', { dateFrom: options.dateFrom })
    if (options.dateTo) qb.andWhere('e.eventDate <= :dateTo', { dateTo: options.dateTo })
    if (options.search) {
      qb.andWhere('(e.title ILIKE :s OR e.location ILIKE :s)', { s: `%${options.search}%` })
    }

    qb.skip((page - 1) * pageSize).take(pageSize)

    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, pageSize }
  }

  async findUpcoming() {
    return this.repo.find({
      where: { status: 'upcoming' },
      order: { eventDate: 'ASC' },
      take: 10
    })
  }

  async findOne(id: string) {
    const event = await this.repo.findOne({ where: { id } })
    if (!event) throw new NotFoundException('Evento no encontrado')
    return event
  }

  async create(dto: CreateEventDto) {
    const event = this.repo.create({
      ...dto,
      eventDate: new Date(dto.eventDate),
      registrations: [],
      reminders: []
    })
    return this.repo.save(event)
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOne(id)
    const updated: any = { ...dto }
    if (dto.eventDate) {
      updated.eventDate = new Date(dto.eventDate)
    }
    await this.repo.update(id, updated)
    return this.findOne(id)
  }

  async delete(id: string) {
    const event = await this.findOne(id)
    await this.repo.delete(event.id)
    return { ok: true }
  }

  /**
   * Registrar un usuario en un evento.
   * Verifica capacidad disponible e incrementa registeredCount.
   */
  async registerUser(eventId: string, userId: string) {
    const event = await this.findOne(eventId)
    if (event.capacity > 0 && event.registeredCount >= event.capacity) {
      throw new BadRequestException('Evento completo - capacidad alcanzada')
    }
    const registrations = event.registrations || []
    const exists = registrations.find(r => r.userId === userId)
    if (exists) throw new BadRequestException('Usuario ya registrado en este evento')

    registrations.push({
      userId,
      registeredAt: new Date().toISOString(),
      attended: false,
      certificateIssued: false
    })

    await this.repo.update(eventId, {
      registrations,
      registeredCount: registrations.length
    })
    return this.findOne(eventId)
  }

  /**
   * Marcar asistencia de un usuario registrado.
   */
  async markAttendance(eventId: string, userId: string, attended: boolean) {
    const event = await this.findOne(eventId)
    const registrations = event.registrations || []
    const reg = registrations.find(r => r.userId === userId)
    if (!reg) throw new NotFoundException('Usuario no registrado en evento')
    reg.attended = attended
    await this.repo.update(eventId, { registrations })
    return this.findOne(eventId)
  }

  /**
   * Emitir certificado digital (marca flag en registro).
   */
  async issueCertificate(eventId: string, userId: string) {
    const event = await this.findOne(eventId)
    const registrations = event.registrations || []
    const reg = registrations.find(r => r.userId === userId)
    if (!reg) throw new NotFoundException('Usuario no registrado en evento')
    if (!reg.attended) throw new BadRequestException('Usuario no asistió al evento')
    reg.certificateIssued = true
    await this.repo.update(eventId, { registrations })
    return this.findOne(eventId)
  }

  /**
   * Agregar recordatorio enviado a la lista del evento.
   */
  async addReminder(eventId: string, type: string, recipient: string) {
    const event = await this.findOne(eventId)
    const reminders = event.reminders || []
    reminders.push({ sentAt: new Date().toISOString(), type, recipient })
    await this.repo.update(eventId, { reminders })
    return this.findOne(eventId)
  }

  /**
   * Subir imagen de portada.
   */
  async uploadCoverImage(eventId: string, file: Express.Multer.File) {
    const event = await this.findOne(eventId)
    if (!file) throw new BadRequestException('Archivo no recibido')
    const key = `events/${eventId}/cover-${Date.now()}-${file.originalname}`
    const url = await this.blob.uploadFile(key, file.buffer, file.mimetype)
    await this.repo.update(eventId, { coverImageUrl: url })
    return this.findOne(eventId)
  }

  /**
   * Estadísticas de eventos para dashboard.
   */
  async stats() {
    const total = await this.repo.count()
    const upcoming = await this.repo.count({ where: { status: 'upcoming' } })
    const past = await this.repo.count({ where: { status: 'past' } })
    const cancelled = await this.repo.count({ where: { status: 'cancelled' } })
    const recent = await this.repo.find({ order: { createdAt: 'DESC' }, take: 5 })
    return { total, upcoming, past, cancelled, recent }
  }
}
