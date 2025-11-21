import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MemberProfile } from './member-profile.entity'
import { MembersService } from './members.service'
import { MembersController } from './members.controller'
import { BlobService } from '../../services/blob.service'

@Module({
  imports: [TypeOrmModule.forFeature([MemberProfile])],
  providers: [MembersService, BlobService],
  controllers: [MembersController],
  exports: [MembersService]
})
export class MembersModule {}
