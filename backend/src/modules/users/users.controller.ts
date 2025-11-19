import { Controller, Get, Post, Param, Body, Patch, Delete, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { RolesGuard } from '../../guards/roles.guard'
import { Roles } from '../../decorators/roles.decorator'

/** Controller REST para gestión de usuarios */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('Administrador')
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @Roles('Administrador')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  @Roles('Administrador')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
