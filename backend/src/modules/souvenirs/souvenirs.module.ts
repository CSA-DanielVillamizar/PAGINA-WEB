import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Souvenir } from './souvenir.entity'
import { SouvenirsService } from './souvenirs.service'
import { SouvenirsController } from './souvenirs.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Souvenir])],
  providers: [SouvenirsService],
  controllers: [SouvenirsController],
  exports: [SouvenirsService]
})
export class SouvenirsModule {}
