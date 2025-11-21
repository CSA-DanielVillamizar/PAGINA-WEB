import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, ValidationPipe } from '@nestjs/common'
import { NewsService } from './news.service'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('authorId') authorId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.newsService.findAll({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      category,
      authorId,
      tag,
      search
    })
  }

  @Get('recent')
  async findRecent(@Query('limit') limit?: string) {
    const l = limit ? parseInt(limit) : 10
    return this.newsService.findRecent(l)
  }

  @Get('stats')
  async stats() {
    return this.newsService.stats()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id)
  }

  @Post()
  async create(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: CreateNewsDto) {
    return this.newsService.create(body)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) body: UpdateNewsDto
  ) {
    return this.newsService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id)
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    return this.newsService.publish(id)
  }

  @Post(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.newsService.unpublish(id)
  }

  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    return this.newsService.incrementView(id)
  }

  @Post(':id/featured-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFeatured(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.newsService.uploadFeaturedImage(id, file)
  }
}
