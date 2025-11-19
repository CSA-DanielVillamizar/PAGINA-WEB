import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { EventsService } from './events.service'

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findAll() {
    return this.eventsService.findAll()
  }

  @Get('upcoming')
  async findUpcoming() {
    return this.eventsService.findUpcoming()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id)
  }

  @Post()
  async create(@Body() body: any) {
    return this.eventsService.create(body)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.eventsService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.eventsService.delete(id)
  }
}
