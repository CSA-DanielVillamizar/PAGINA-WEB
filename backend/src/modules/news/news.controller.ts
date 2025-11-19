import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { NewsService } from './news.service'

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  async findAll() {
    return this.newsService.findAll()
  }

  @Get('recent')
  async findRecent(@Query('limit') limit?: string) {
    const l = limit ? parseInt(limit) : 10
    return this.newsService.findRecent(l)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id)
  }

  @Post()
  async create(@Body() body: any) {
    return this.newsService.create(body)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.newsService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id)
  }
}
