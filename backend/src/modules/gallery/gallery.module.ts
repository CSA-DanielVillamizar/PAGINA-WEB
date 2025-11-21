import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GalleryAlbum } from './gallery.entity'
import { GalleryService } from './gallery.service'
import { GalleryController } from './gallery.controller'
import { BlobService } from '../../services/blob.service'

@Module({
  imports: [TypeOrmModule.forFeature([GalleryAlbum])],
  providers: [GalleryService, BlobService],
  controllers: [GalleryController],
  exports: [GalleryService]
})
export class GalleryModule {}
