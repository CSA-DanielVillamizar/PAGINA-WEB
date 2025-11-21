import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Vehicle } from './vehicle.entity'
import { BlobService } from '../../services/blob.service'
import { CreateVehicleDto } from './dto/create-vehicle.dto'
import { UpdateVehicleDto } from './dto/update-vehicle.dto'

/**
 * Servicio de vehículos.
 * Responsable de aplicar reglas de negocio: paginación, filtrado, transferencia de propietario,
 * mantenimiento del historial y carga de imágenes mediante Blob Storage.
 */
@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private repo: Repository<Vehicle>,
    private blob: BlobService
  ) {}

  /**
   * Consulta paginada y filtrada de vehículos.
   * Filtros soportados: status, brand, model, year (exacto), search (placa / vin / modelo).
   */
  async findAll(options: {
    page?: number
    pageSize?: number
    status?: string
    brand?: string
    model?: string
    year?: number
    search?: string
  }) {
    const page = Math.max(options.page || 1, 1)
    const pageSize = Math.min(Math.max(options.pageSize || 10, 1), 100)

    const qb = this.repo.createQueryBuilder('v').orderBy('v.createdAt', 'DESC')

    if (options.status) qb.andWhere('v.status = :status', { status: options.status })
    if (options.brand) qb.andWhere('v.brand ILIKE :brand', { brand: `%${options.brand}%` })
    if (options.model) qb.andWhere('v.model ILIKE :model', { model: `%${options.model}%` })
    if (options.year) qb.andWhere('v.year = :year', { year: options.year })
    if (options.search) {
      qb.andWhere(
        '(v.licensePlate ILIKE :s OR v.vin ILIKE :s OR v.model ILIKE :s OR v.brand ILIKE :s)',
        { s: `%${options.search}%` }
      )
    }

    qb.skip((page - 1) * pageSize).take(pageSize)

    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, pageSize }
  }

  async findByUser(userId: string) {
    return this.repo.find({ where: { ownerUserId: userId } })
  }

  async findOne(id: string) {
    const vehicle = await this.repo.findOne({ where: { id } })
    if (!vehicle) throw new NotFoundException('Vehículo no encontrado')
    return vehicle
  }

  async create(dto: CreateVehicleDto) {
    const existing = await this.repo.findOne({ where: { licensePlate: dto.licensePlate } })
    if (existing) throw new BadRequestException('La placa ya está registrada')

    const vehicle = this.repo.create({
      ...dto,
      ownershipHistory: [
        { date: new Date().toISOString(), action: 'CREATED', userId: dto.ownerUserId }
      ]
    })
    return this.repo.save(vehicle)
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id)

    let history = vehicle.ownershipHistory || []
    if (dto.ownerUserId && dto.ownerUserId !== vehicle.ownerUserId) {
      history = [
        ...history,
        { date: new Date().toISOString(), action: 'TRANSFER', userId: dto.ownerUserId }
      ]
    }

    await this.repo.update(id, { ...dto, ownershipHistory: history })
    return this.findOne(id)
  }

  async delete(id: string) {
    const vehicle = await this.findOne(id)
    await this.repo.delete(vehicle.id)
    return { ok: true }
  }

  async transferOwner(vehicleId: string, newUserId: string) {
    const vehicle = await this.findOne(vehicleId)
    const history = vehicle.ownershipHistory || []
    history.push({ date: new Date().toISOString(), action: 'TRANSFER', userId: newUserId })
    await this.repo.update(vehicleId, { ownerUserId: newUserId, ownershipHistory: history })
    return this.findOne(vehicleId)
  }

  async addImages(vehicleId: string, files: Express.Multer.File[]) {
    const vehicle = await this.findOne(vehicleId)
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibieron archivos')
    }
    const stored: string[] = []
    for (const file of files) {
      const key = `vehicles/${vehicleId}/${Date.now()}-${file.originalname}`
      const url = await this.blob.uploadFile(key, file.buffer, file.mimetype)
      stored.push(url)
    }
    const images = (vehicle.images || []).concat(stored)
    await this.repo.update(vehicleId, { images })
    return this.findOne(vehicleId)
  }

  async stats() {
    const total = await this.repo.count()
    const active = await this.repo.count({ where: { status: 'active' } })
    const inactive = await this.repo.count({ where: { status: 'inactive' } })
    const recent = await this.repo.find({ order: { createdAt: 'DESC' }, take: 5 })
    return { total, active, inactive, recent }
  }
}
