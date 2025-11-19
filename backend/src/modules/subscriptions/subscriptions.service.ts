import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Subscription } from './subscription.entity'

@Injectable()
export class SubscriptionsService {
  constructor(@InjectRepository(Subscription) private repo: Repository<Subscription>) {}

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } })
  }

  async findByEmail(correo: string) {
    return this.repo.findOne({ where: { email: correo } })
  }

  async subscribe(correo: string) {
    const exists = await this.findByEmail(correo)
    if (exists) {
      return { ok: false, message: 'Ya estás suscrito' }
    }
    const sub = this.repo.create({ email: correo, status: 'active' })
    await this.repo.save(sub)
    return { ok: true, message: 'Suscripción exitosa' }
  }

  async unsubscribe(correo: string) {
    await this.repo.update({ email: correo }, { status: 'inactive' })
    return { ok: true, message: 'Desuscripción exitosa' }
  }
}
