import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Event } from './event.entity'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'
import { BlobService } from '../../services/blob.service'

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventsService, BlobService],
  controllers: [EventsController],
  exports: [EventsService]
})
export class EventsModule {}
