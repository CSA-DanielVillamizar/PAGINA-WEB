import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from './role.entity'

/**
 * Servicio para gestión de roles del sistema.
 * Los roles definidos son: Presidente, Vicepresidente, Secretario, Tesorero,
 * GerenciaNegocios, MTO, Administrador, CommunityManager, Miembro, Invitado.
 */
@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private repo: Repository<Role>) {}

  async findAll() {
    return this.repo.find()
  }

  async findByName(name: string) {
    return this.repo.findOne({ where: { name } })
  }

  async create(data: Partial<Role>) {
    const role = this.repo.create(data)
    return this.repo.save(role)
  }

  async seed() {
    const roleNames = [
      'Presidente',
      'Vicepresidente',
      'Secretario',
      'Tesorero',
      'GerenciaNegocios',
      'MTO',
      'Administrador',
      'CommunityManager',
      'Miembro',
      'Invitado'
    ]
    for (const name of roleNames) {
      const exists = await this.findByName(name)
      if (!exists) {
        await this.create({ name, description: `Rol ${name}` })
      }
    }
  }
}
