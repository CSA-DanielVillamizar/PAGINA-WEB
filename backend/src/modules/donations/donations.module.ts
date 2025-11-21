import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Donation } from './donation.entity'
import { DonationsService } from './donations.service'
import { DonationsController } from './donations.controller'
import { BlobService } from '../../services/blob.service'

@Module({
  imports: [TypeOrmModule.forFeature([Donation])],
  providers: [DonationsService, BlobService],
  controllers: [DonationsController],
  exports: [DonationsService]
})
export class DonationsModule {}
