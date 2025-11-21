import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Donation } from './donation.entity'
import { BlobService } from '../../services/blob.service'
import { CreateDonationDto } from './dto/create-donation.dto'
import { UpdateDonationDto } from './dto/update-donation.dto'
import PDFDocument from 'pdfkit'

/**
 * Servicio de donaciones.
 * Gestiona lógica de negocio: paginación, filtrado, generación de recibos PDF,
 * tracking de pagos y estadísticas.
 */
@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation) private repo: Repository<Donation>,
    private blob: BlobService
  ) {}

  /**
   * Listado paginado y filtrado de donaciones.
   * Filtros: status, userId, dateFrom, dateTo, minAmount, maxAmount.
   */
  async findAll(options: {
    page?: number
    pageSize?: number
    status?: string
    userId?: string
    dateFrom?: string
    dateTo?: string
    minAmount?: number
    maxAmount?: number
  }) {
    const page = Math.max(options.page || 1, 1)
    const pageSize = Math.min(Math.max(options.pageSize || 10, 1), 100)

    const qb = this.repo.createQueryBuilder('d')
      .leftJoinAndSelect('d.user', 'user')
      .orderBy('d.createdAt', 'DESC')

    if (options.status) qb.andWhere('d.status = :status', { status: options.status })
    if (options.userId) qb.andWhere('d.userId = :userId', { userId: options.userId })
    if (options.dateFrom) qb.andWhere('d.createdAt >= :dateFrom', { dateFrom: options.dateFrom })
    if (options.dateTo) qb.andWhere('d.createdAt <= :dateTo', { dateTo: options.dateTo })
    if (options.minAmount) qb.andWhere('d.amount >= :minAmount', { minAmount: options.minAmount })
    if (options.maxAmount) qb.andWhere('d.amount <= :maxAmount', { maxAmount: options.maxAmount })

    qb.skip((page - 1) * pageSize).take(pageSize)

    const [items, total] = await qb.getManyAndCount()
    return { items, total, page, pageSize }
  }

  async findOne(id: string) {
    const donation = await this.repo.findOne({ where: { id }, relations: ['user'] })
    if (!donation) throw new NotFoundException('Donación no encontrada')
    return donation
  }

  async create(dto: CreateDonationDto) {
    const receiptNumber = this.generateReceiptNumber()
    const donation = this.repo.create({
      ...dto,
      receiptNumber
    })
    return this.repo.save(donation)
  }

  async update(id: string, dto: UpdateDonationDto) {
    const donation = await this.findOne(id)
    await this.repo.update(id, dto)
    return this.findOne(id)
  }

  async delete(id: string) {
    const donation = await this.findOne(id)
    await this.repo.delete(donation.id)
    return { ok: true }
  }

  /**
   * Genera recibo PDF y lo sube a Blob Storage.
   * Retorna URL del recibo generado.
   */
  async generateReceipt(id: string): Promise<string> {
    const donation = await this.findOne(id)
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks)
          const key = `receipts/${donation.id}/${donation.receiptNumber}.pdf`
          const url = await this.blob.uploadFile(key, pdfBuffer, 'application/pdf')
          
          await this.repo.update(donation.id, { receiptUrl: url })
          resolve(url)
        } catch (err) {
          reject(err)
        }
      })

      // Contenido del PDF
      doc.fontSize(20).text('RECIBO DE DONACIÓN', { align: 'center' })
      doc.moveDown()
      doc.fontSize(12).text(`Número de Recibo: ${donation.receiptNumber}`)
      doc.text(`Fecha: ${donation.createdAt.toLocaleDateString('es-CO')}`)
      doc.text(`Monto: ${donation.amount} ${donation.currency}`)
      doc.text(`Método de Pago: ${donation.paymentMethod || 'N/A'}`)
      if (donation.transactionId) {
        doc.text(`ID de Transacción: ${donation.transactionId}`)
      }
      if (donation.description) {
        doc.moveDown()
        doc.text(`Descripción: ${donation.description}`)
      }
      doc.moveDown()
      doc.fontSize(10).text('Gracias por su generosa contribución.', { align: 'center' })
      
      doc.end()
    })
  }

  /**
   * Estadísticas de donaciones.
   */
  async stats() {
    const total = await this.repo.count()
    const completed = await this.repo.count({ where: { status: 'completed' } })
    const pending = await this.repo.count({ where: { status: 'pending' } })
    
    const sumResult = await this.repo
      .createQueryBuilder('d')
      .select('SUM(d.amount)', 'totalAmount')
      .where('d.status = :status', { status: 'completed' })
      .getRawOne()
    
    const recent = await this.repo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5
    })

    return {
      total,
      completed,
      pending,
      totalAmount: parseFloat(sumResult.totalAmount || '0'),
      recent
    }
  }

  /**
   * Total de donaciones completadas.
   */
  async getTotalDonations() {
    const result = await this.repo
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.status = :status', { status: 'completed' })
      .getRawOne()
    return { total: parseFloat(result.total || '0') }
  }

  /**
   * Genera número único de recibo.
   */
  private generateReceiptNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `REC-${year}${month}${day}-${random}`
  }
}
