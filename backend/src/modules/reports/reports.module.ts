import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { User } from '../users/user.entity';
import { MemberProfile } from '../members/member-profile.entity';
import { Event } from '../events/event.entity';
import { Donation } from '../donations/donation.entity';
import { Souvenir } from '../souvenirs/souvenir.entity';
import { Subscription } from '../subscriptions/subscription.entity';

/**
 * Módulo de reportes que proporciona exportación de datos en CSV y PDF.
 * Requiere autenticación y roles administrativos para acceder.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      MemberProfile,
      Event,
      Donation,
      Souvenir,
      Subscription,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
