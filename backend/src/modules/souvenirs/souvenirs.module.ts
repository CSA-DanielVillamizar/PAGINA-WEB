import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Souvenir } from './souvenir.entity'
import { SouvenirsService } from './souvenirs.service'
import { SouvenirsController } from './souvenirs.controller'
import { BlobService } from '../../services/blob.service'

@Module({
  imports: [TypeOrmModule.forFeature([Souvenir])],
  providers: [SouvenirsService, BlobService],
  controllers: [SouvenirsController],
  exports: [SouvenirsService]
})
export class SouvenirsModule {}
