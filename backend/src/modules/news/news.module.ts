import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { News } from './news.entity'
import { NewsService } from './news.service'
import { NewsController } from './news.controller'
import { BlobService } from '../../services/blob.service'

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  providers: [NewsService, BlobService],
  controllers: [NewsController],
  exports: [NewsService]
})
export class NewsModule {}
