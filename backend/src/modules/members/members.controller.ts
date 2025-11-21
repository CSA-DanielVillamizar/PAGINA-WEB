import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, ValidationPipe, ParseIntPipe } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MembersService } from './members.service'
import { CreateMemberDto } from './dto/create-member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'

/**
 * Controlador Members
 * Expone operaciones CRUD de perfiles de miembros, carga de foto y estadísticas.
 */
@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('status') status?: string,
    @Query('chapter') chapter?: string,
    @Query('search') search?: string
  ) {
    return this.membersService.findAll({ page, pageSize, status, chapter, search })
  }

  @Get('stats')
  async stats() {
    return this.membersService.stats()
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.membersService.findOne(userId)
  }

  @Post()
  async create(@Body(new ValidationPipe({ whitelist: true })) body: CreateMemberDto) {
    return this.membersService.create(body)
  }

  @Put(':userId')
  async update(
    @Param('userId') userId: string,
    @Body(new ValidationPipe({ whitelist: true })) body: UpdateMemberDto
  ) {
    return this.membersService.update(userId, body)
  }

  @Post(':userId/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.membersService.uploadProfileImage(userId, file)
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.membersService.delete(userId)
  }
}
