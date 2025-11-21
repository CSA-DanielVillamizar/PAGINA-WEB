import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Subscription } from './subscription.entity'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { randomUUID } from 'crypto'

@Injectable()
export class SubscriptionsService {
  constructor(@InjectRepository(Subscription) private repo: Repository<Subscription>) {}

  /**
   * Obtener todas las suscripciones con paginación y filtros.
   */
  async findAll(options?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    search?: string
  }) {
    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit

    const query = this.repo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.user', 'user')

    if (options?.status) {
      query.andWhere('s.status = :status', { status: options.status })
    }

    if (options?.type) {
      query.andWhere('s.type = :type', { type: options.type })
    }

    if (options?.search) {
      query.andWhere('(s.email ILIKE :search OR s.name ILIKE :search)', {
        search: `%${options.search}%`
      })
    }

    query.skip(skip).take(limit).orderBy('s.createdAt', 'DESC')

    const [data, total] = await query.getManyAndCount()

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Buscar suscripción por email.
   */
  async findByEmail(correo: string): Promise<Subscription | null> {
    return this.repo.findOne({ where: { email: correo } })
  }

  /**
   * Buscar suscripción por ID.
   */
  async findOne(id: string): Promise<Subscription | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] })
  }

  /**
   * Crear nueva suscripción con token de confirmación.
   */
  async subscribe(dto: CreateSubscriptionDto) {
    const existing = await this.findByEmail(dto.email)
    if (existing && existing.status === 'active') {
      return { ok: false, message: 'El email ya está suscrito' }
    }

    const confirmToken = randomUUID()
    const unsubscribeToken = randomUUID()

    const subscription = this.repo.create({
      ...dto,
      status: 'pending',
      confirmToken,
      unsubscribeToken
    })

    const saved = await this.repo.save(subscription)

    // TODO: Enviar email de confirmación con link: /subscriptions/confirm/${confirmToken}
    // await this.mailerService.sendConfirmationEmail(saved.email, confirmToken)

    return { ok: true, data: saved, confirmToken }
  }

  /**
   * Confirmar suscripción mediante token.
   */
  async confirm(token: string) {
    const subscription = await this.repo.findOne({ where: { confirmToken: token } })

    if (!subscription) {
      return { ok: false, message: 'Token inválido o expirado' }
    }

    if (subscription.confirmedAt) {
      return { ok: false, message: 'La suscripción ya está confirmada' }
    }

    subscription.confirmedAt = new Date()
    subscription.status = 'active'
    subscription.confirmToken = null // Invalida el token tras confirmación

    await this.repo.save(subscription)

    return { ok: true, message: 'Suscripción confirmada exitosamente', data: subscription }
  }

  /**
   * Dar de baja suscripción por email (método legacy).
   */
  async unsubscribe(correo: string) {
    const subscription = await this.findByEmail(correo)
    if (!subscription) {
      return { ok: false, message: 'Email no encontrado' }
    }

    subscription.status = 'inactive'
    subscription.unsubscribedAt = new Date()
    await this.repo.save(subscription)

    return { ok: true, message: 'Suscripción cancelada' }
  }

  /**
   * Dar de baja suscripción mediante token único.
   */
  async unsubscribeByToken(token: string) {
    const subscription = await this.repo.findOne({ where: { unsubscribeToken: token } })

    if (!subscription) {
      return { ok: false, message: 'Token inválido' }
    }

    if (subscription.status === 'inactive') {
      return { ok: false, message: 'La suscripción ya está cancelada' }
    }

    subscription.status = 'inactive'
    subscription.unsubscribedAt = new Date()
    await this.repo.save(subscription)

    return { ok: true, message: 'Suscripción cancelada exitosamente', data: subscription }
  }

  /**
   * Actualizar suscripción.
   */
  async update(id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.findOne(id)
    if (!subscription) {
      return { ok: false, message: 'Suscripción no encontrada' }
    }

    Object.assign(subscription, dto)
    const updated = await this.repo.save(subscription)

    return { ok: true, data: updated }
  }

  /**
   * Eliminar suscripción.
   */
  async delete(id: string) {
    const result = await this.repo.delete(id)
    return { ok: result.affected > 0 }
  }

  /**
   * Reenviar email de confirmación.
   */
  async resendConfirmation(email: string) {
    const subscription = await this.findByEmail(email)

    if (!subscription) {
      return { ok: false, message: 'Email no encontrado' }
    }

    if (subscription.confirmedAt) {
      return { ok: false, message: 'La suscripción ya está confirmada' }
    }

    // Genera nuevo token si el anterior expiró o se perdió
    if (!subscription.confirmToken) {
      subscription.confirmToken = randomUUID()
      await this.repo.save(subscription)
    }

    // TODO: Reenviar email de confirmación
    // await this.mailerService.sendConfirmationEmail(subscription.email, subscription.confirmToken)

    return { ok: true, message: 'Email de confirmación reenviado', confirmToken: subscription.confirmToken }
  }

  /**
   * Obtener estadísticas de suscripciones.
   */
  async stats() {
    const [total, active, pending, inactive] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { status: 'active' } }),
      this.repo.count({ where: { status: 'pending' } }),
      this.repo.count({ where: { status: 'inactive' } })
    ])

    const recent = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user']
    })

    return {
      total,
      active,
      pending,
      inactive,
      recent
    }
  }
}
