import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { Role } from '../roles/role.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as bcrypt from 'bcrypt'

/** Servicio de negocio para gestión de usuarios */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>
  ) {}

  async findAll() {
    return this.usersRepo.find({ relations: ['roles'] })
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOne({ where: { id }, relations: ['roles'] })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  async create(dto: CreateUserDto) {
    const roles = await this.rolesRepo.find({ where: dto.roles.map(name => ({ name })) })
    const user = this.usersRepo.create({
      nombreCompleto: dto.nombreCompleto,
      correo: dto.correo,
      passwordHash: dto.password ? await bcrypt.hash(dto.password, 10) : undefined,
      roles
    })
    return this.usersRepo.save(user)
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id)
    if (dto.nombreCompleto) user.nombreCompleto = dto.nombreCompleto
    if (dto.correo) user.correo = dto.correo
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 10)
    if (dto.estado) user.estado = dto.estado
    if (dto.roles) {
      const roles = await this.rolesRepo.find({ where: dto.roles.map(name => ({ name })) })
      user.roles = roles
    }
    return this.usersRepo.save(user)
  }

  async remove(id: string) {
    const user = await this.findOne(id)
    await this.usersRepo.remove(user)
    return { deleted: true }
  }
}
