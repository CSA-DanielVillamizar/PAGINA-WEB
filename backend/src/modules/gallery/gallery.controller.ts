import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, UploadedFiles, ValidationPipe } from '@nestjs/common'
import { GalleryService } from './gallery.service'
import { CreateGalleryAlbumDto } from './dto/create-gallery-album.dto'
import { UpdateGalleryAlbumDto } from './dto/update-gallery-album.dto'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('eventoId') eventoId?: string,
    @Query('search') search?: string,
  ) {
    return this.galleryService.findAll({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      eventoId,
      search
    })
  }

  @Get('stats')
  async stats() {
    return this.galleryService.stats()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id)
  }

  @Post()
  async create(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: CreateGalleryAlbumDto) {
    return this.galleryService.create(body)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) body: UpdateGalleryAlbumDto
  ) {
    return this.galleryService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.galleryService.delete(id)
  }

  @Post(':id/images/bulk')
  @UseInterceptors(FilesInterceptor('files'))
  async bulkUpload(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.galleryService.bulkUploadImages(id, files)
  }

  @Post(':id/thumbnail')
  @UseInterceptors(FileInterceptor('file'))
  async setThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.galleryService.setThumbnail(id, file)
  }

  @Delete(':id/images/:index')
  async removeImage(
    @Param('id') id: string,
    @Param('index') index: string
  ) {
    return this.galleryService.removeImage(id, parseInt(index))
  }

  @Post(':id/images')
  async addImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    return this.galleryService.addImage(id, imageUrl)
  }
}
