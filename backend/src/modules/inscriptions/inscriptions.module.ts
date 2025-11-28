import { Module } from '@nestjs/common'
import { InscriptionsController } from './inscriptions.controller'
import { MailerService } from '../../services/mailer.service'

@Module({
  controllers: [InscriptionsController],
  providers: [MailerService],
})
export class InscriptionsModule {}
