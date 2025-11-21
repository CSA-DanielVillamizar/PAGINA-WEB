import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Vehicle } from './vehicle.entity'
import { VehiclesService } from './vehicles.service'
import { VehiclesController } from './vehicles.controller'
import { BlobService } from '../../services/blob.service'

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [VehiclesService, BlobService],
  controllers: [VehiclesController],
  exports: [VehiclesService]
})
export class VehiclesModule {}
