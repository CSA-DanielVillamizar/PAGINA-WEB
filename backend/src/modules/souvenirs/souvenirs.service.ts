import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Souvenir } from './souvenir.entity'
import { CreateSouvenirDto } from './dto/create-souvenir.dto'
import { UpdateSouvenirDto } from './dto/update-souvenir.dto'
import { AdjustInventoryDto } from './dto/adjust-inventory.dto'
import { BlobService } from '../../services/blob.service'

@Injectable()
export class SouvenirsService {
  constructor(
    @InjectRepository(Souvenir) private repo: Repository<Souvenir>,
    private blobService: BlobService
  ) {}

  /**
   * Obtener todos los souvenirs con paginación y filtros.
   */
  async findAll(options?: {
    page?: number
    limit?: number
    category?: string
    status?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    search?: string
  }) {
    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit

    const query = this.repo.createQueryBuilder('s')

    if (options?.category) {
      query.andWhere('s.category = :category', { category: options.category })
    }

    if (options?.status) {
      query.andWhere('s.status = :status', { status: options.status })
    }

    if (options?.minPrice !== undefined) {
      query.andWhere('s.price >= :minPrice', { minPrice: options.minPrice })
    }

    if (options?.maxPrice !== undefined) {
      query.andWhere('s.price <= :maxPrice', { maxPrice: options.maxPrice })
    }

    if (options?.inStock !== undefined) {
      if (options.inStock) {
        query.andWhere('s.stock > 0')
      } else {
        query.andWhere('s.stock = 0')
      }
    }

    if (options?.search) {
      query.andWhere('(s.name ILIKE :search OR s.description ILIKE :search)', {
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
   * Buscar souvenirs por categoría.
   */
  async findByCategory(categoria: string) {
    return this.repo.find({ where: { category: categoria } })
  }

  /**
   * Buscar souvenir por ID.
   */
  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  /**
   * Crear nuevo souvenir con inventario inicial.
   */
  async create(dto: CreateSouvenirDto) {
    const inventory = {
      quantity: dto.stock || 0,
      reserved: 0,
      available: dto.stock || 0,
      lastRestockDate: new Date()
    }

    const souvenir = this.repo.create({
      ...dto,
      inventory,
      transactions: []
    })

    return this.repo.save(souvenir)
  }

  /**
   * Actualizar souvenir.
   */
  async update(id: string, dto: UpdateSouvenirDto) {
    const souvenir = await this.findOne(id)
    if (!souvenir) {
      return { ok: false, message: 'Souvenir no encontrado' }
    }

    Object.assign(souvenir, dto)
    const updated = await this.repo.save(souvenir)

    return { ok: true, data: updated }
  }

  /**
   * Eliminar souvenir.
   */
  async delete(id: string) {
    const result = await this.repo.delete(id)
    return { ok: result.affected > 0 }
  }

  /**
   * Ajustar inventario y registrar transacción.
   */
  async adjustInventory(id: string, dto: AdjustInventoryDto) {
    const souvenir = await this.findOne(id)
    if (!souvenir) {
      return { ok: false, message: 'Souvenir no encontrado' }
    }

    const currentInventory = souvenir.inventory || {
      quantity: souvenir.stock,
      reserved: 0,
      available: souvenir.stock,
      lastRestockDate: new Date()
    }

    // Ajustar cantidad según tipo de transacción
    let newQuantity = currentInventory.quantity
    if (dto.type === 'sale') {
      newQuantity -= Math.abs(dto.quantity)
    } else if (dto.type === 'restock') {
      newQuantity += Math.abs(dto.quantity)
    } else if (dto.type === 'return') {
      newQuantity += Math.abs(dto.quantity)
    } else if (dto.type === 'adjustment') {
      newQuantity = dto.quantity // Ajuste directo a cantidad específica
    }

    // Validar que no quede negativo
    if (newQuantity < 0) {
      return { ok: false, message: 'Cantidad insuficiente en inventario' }
    }

    // Actualizar inventario
    const updatedInventory = {
      quantity: newQuantity,
      reserved: currentInventory.reserved,
      available: newQuantity - currentInventory.reserved,
      lastRestockDate: dto.type === 'restock' ? new Date() : currentInventory.lastRestockDate
    }

    // Registrar transacción
    const transaction = {
      date: new Date(),
      type: dto.type,
      quantity: dto.quantity,
      userId: dto.userId,
      notes: dto.notes
    }

    const transactions = [...(souvenir.transactions || []), transaction]

    // Actualizar souvenir
    souvenir.inventory = updatedInventory
    souvenir.transactions = transactions
    souvenir.stock = newQuantity // Mantener sincronizado el campo legacy stock

    const updated = await this.repo.save(souvenir)

    return {
      ok: true,
      message: `Inventario ajustado: ${dto.type}`,
      data: updated,
      previousQuantity: currentInventory.quantity,
      newQuantity
    }
  }

  /**
   * Actualizar inventario (método legacy - usa adjustInventory internamente).
   */
  async updateInventory(id: string, quantity: number) {
    return this.adjustInventory(id, {
      quantity,
      type: quantity >= 0 ? 'restock' : 'sale',
      notes: 'Actualización manual de inventario'
    })
  }

  /**
   * Subir imagen de producto.
   */
  async uploadImage(id: string, file: Express.Multer.File): Promise<string> {
    const souvenir = await this.findOne(id)
    if (!souvenir) {
      throw new Error('Souvenir no encontrado')
    }

    const timestamp = Date.now()
    const path = `souvenirs/${id}/image-${timestamp}-${file.originalname}`
    const imageUrl = await this.blobService.uploadFile(path, file.buffer, file.mimetype)

    souvenir.imageUrl = imageUrl
    await this.repo.save(souvenir)

    return imageUrl
  }

  /**
   * Obtener estadísticas de souvenirs.
   */
  async stats() {
    const [totalProducts, inStock, outOfStock, totalValue] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { status: 'available' } }),
      this.repo
        .createQueryBuilder('s')
        .where('s.stock = 0')
        .getCount(),
      this.repo
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.price * s.stock), 0)', 'total')
        .getRawOne()
        .then(result => parseFloat(result.total))
    ])

    const recent = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: 5
    })

    const recentTransactions = await this.repo
      .createQueryBuilder('s')
      .select('s.transactions')
      .where("jsonb_array_length(s.transactions) > 0")
      .orderBy('s.updatedAt', 'DESC')
      .take(10)
      .getRawMany()
      .then(results => {
        const allTransactions = []
        results.forEach(r => {
          if (r.transactions && Array.isArray(r.transactions)) {
            allTransactions.push(...r.transactions)
          }
        })
        return allTransactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
      })

    return {
      totalProducts,
      inStock,
      outOfStock,
      totalValue,
      recent,
      recentTransactions
    }
  }
}
