import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, ValidationPipe } from '@nestjs/common'
import { EventsService } from './events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findAll({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      dateFrom,
      dateTo,
      search
    })
  }

  @Get('upcoming')
  async findUpcoming() {
    return this.eventsService.findUpcoming()
  }

  @Get('stats')
  async stats() {
    return this.eventsService.stats()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id)
  }

  @Post()
  async create(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: CreateEventDto) {
    return this.eventsService.create(body)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) body: UpdateEventDto
  ) {
    return this.eventsService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.eventsService.delete(id)
  }

  @Post(':id/register')
  async register(
    @Param('id') id: string,
    @Body('userId') userId: string
  ) {
    return this.eventsService.registerUser(id, userId)
  }

  @Post(':id/attendance')
  async markAttendance(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('attended') attended: boolean
  ) {
    return this.eventsService.markAttendance(id, userId, attended)
  }

  @Post(':id/certificate')
  async issueCertificate(
    @Param('id') id: string,
    @Body('userId') userId: string
  ) {
    return this.eventsService.issueCertificate(id, userId)
  }

  @Post(':id/reminder')
  async addReminder(
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('recipient') recipient: string
  ) {
    return this.eventsService.addReminder(id, type, recipient)
  }

  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.eventsService.uploadCoverImage(id, file)
  }
}
