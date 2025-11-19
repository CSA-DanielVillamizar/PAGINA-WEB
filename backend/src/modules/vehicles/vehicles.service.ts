import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Vehicle } from './vehicle.entity'

@Injectable()
export class VehiclesService {
  constructor(@InjectRepository(Vehicle) private repo: Repository<Vehicle>) {}

  async findAll() {
    return this.repo.find()
  }

  async findByUser(userId: string) {
    // Vehicle entity doesn't have userId - this would need to be added if needed
    return this.repo.find()
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } })
  }

  async create(data: Partial<Vehicle>) {
    const vehicle = this.repo.create(data)
    return this.repo.save(vehicle)
  }

  async update(id: string, data: Partial<Vehicle>) {
    await this.repo.update(id, data)
    return this.findOne(id)
  }

  async delete(id: string) {
    await this.repo.delete(id)
    return { ok: true }
  }

  async transferOwner(vehicleId: string, newUserId: string) {
    const vehicle = await this.findOne(vehicleId)
    if (!vehicle) throw new Error('Vehicle not found')
    
    // Transfer logic would need additional fields in Vehicle entity
    await this.repo.update(vehicleId, {
      notes: `Transferred to user ${newUserId} on ${new Date().toISOString()}`
    })
    return this.findOne(vehicleId)
  }
}
