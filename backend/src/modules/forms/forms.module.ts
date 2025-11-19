import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ApplicationForm } from './application-form.entity'
import { FormsService } from './forms.service'
import { BlobService } from '../../services/blob.service'
import { MailerService } from '../../services/mailer.service'

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationForm])],
  providers: [FormsService, BlobService, MailerService],
  exports: [FormsService]
})
export class FormsModule {}
