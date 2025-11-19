import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { MembersService } from './members.service'

@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  async findAll() {
    return this.membersService.findAll()
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.membersService.findOne(userId)
  }

  @Post()
  async create(@Body() body: any) {
    return this.membersService.create(body)
  }

  @Put(':userId')
  async update(@Param('userId') userId: string, @Body() body: any) {
    return this.membersService.update(userId, body)
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.membersService.delete(userId)
  }
}
