import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MemberProfile } from './member-profile.entity'
import { BlobService } from '../../services/blob.service'
import { CreateMemberDto } from './dto/create-member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'

/**
 * Servicio de miembros
 * Lógica de negocio para gestión de perfiles de miembros con soporte de filtro, paginación y estadísticas.
 */
@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(MemberProfile) private repo: Repository<MemberProfile>,
    private blob: BlobService
  ) {}

  /**
   * Listado paginado y filtrado de perfiles de miembros.
   * Permite filtrar por status, chapter y buscar por membershipNumber o correo.
   */
  async findAll(options: { page?: number; pageSize?: number; status?: string; chapter?: string; search?: string }) {
    const { page = 1, pageSize = 20, status, chapter, search } = options
    const qb = this.repo.createQueryBuilder('m').leftJoinAndSelect('m.user', 'user')
    if (status) qb.andWhere('m.status = :status', { status })
    if (chapter) qb.andWhere('m.chapter = :chapter', { chapter })
    if (search) qb.andWhere('(m.membershipNumber ILIKE :s OR user.correo ILIKE :s)', { s: `%${search}%` })
    qb.orderBy('m.createdAt', 'DESC').skip((page - 1) * pageSize).take(pageSize)
    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, pageSize }
  }

  async findOne(userId: string) {
    const profile = await this.repo.findOne({ where: { userId }, relations: ['user'] })
    if (!profile) throw new NotFoundException('Perfil no encontrado')
    return profile
  }

  async create(dto: CreateMemberDto) {
    const profile = this.repo.create({
      ...dto,
      memberSince: dto.memberSince ? new Date(dto.memberSince) : undefined,
      renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : undefined
    })
    return this.repo.save(profile)
  }

  async update(userId: string, dto: UpdateMemberDto) {
    const existing = await this.findOne(userId)
    Object.assign(existing, {
      ...dto,
      memberSince: dto.memberSince ? new Date(dto.memberSince) : existing.memberSince,
      renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : existing.renewalDate
    })
    return this.repo.save(existing)
  }

  async delete(userId: string) {
    await this.repo.delete({ userId })
    return { ok: true }
  }

  /**
   * Sube imagen de perfil a Blob Storage y actualiza el perfil.
   */
  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    const profile = await this.findOne(userId)
    const extension = file.originalname.split('.').pop() || 'jpg'
    const blobName = `members/${userId}-${Date.now()}.${extension}`
    const url = await this.blob.uploadFile(blobName, file.buffer, file.mimetype)
    profile.profileImageUrl = url
    await this.repo.save(profile)
    return { profileImageUrl: url }
  }

  /**
   * Estadísticas básicas de membresía.
   */
  async stats() {
    const total = await this.repo.count()
    const active = await this.repo.count({ where: { status: 'active' } })
    const inactive = await this.repo.count({ where: { status: 'inactive' } })
    const recent = await this.repo.createQueryBuilder('m')
      .orderBy('m.createdAt', 'DESC')
      .limit(5)
      .getMany()
    return { total, active, inactive, recent }
  }
}
