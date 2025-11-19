import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { GalleryService } from './gallery.service'

@Controller('gallery')
export class GalleryController {
  constructor(private galleryService: GalleryService) {}

  @Get()
  async findAll() {
    return this.galleryService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id)
  }

  @Post()
  async create(@Body() body: any) {
    return this.galleryService.create(body)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.galleryService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.galleryService.delete(id)
  }

  @Post(':id/images')
  async addImage(@Param('id') id: string, @Body('imageUrl') imageUrl: string) {
    return this.galleryService.addImage(id, imageUrl)
  }
}
