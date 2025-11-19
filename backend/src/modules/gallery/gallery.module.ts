import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GalleryAlbum } from './gallery.entity'
import { GalleryService } from './gallery.service'
import { GalleryController } from './gallery.controller'

@Module({
  imports: [TypeOrmModule.forFeature([GalleryAlbum])],
  providers: [GalleryService],
  controllers: [GalleryController],
  exports: [GalleryService]
})
export class GalleryModule {}
