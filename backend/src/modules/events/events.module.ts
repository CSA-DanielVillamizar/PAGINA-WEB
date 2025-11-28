import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

/**
 * Módulo de eventos L.A.M.A. Medellín
 * Sistema completo: calendario, inscripciones, ranking deportivo
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventParticipant])
  ],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService]
})
export class EventsModule {}
