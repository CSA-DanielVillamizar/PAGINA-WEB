import { Controller, Get, Post, Body } from '@nestjs/common'
import { RolesService } from './roles.service'

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll()
  }

  @Post()
  async create(@Body() body: any) {
    return this.rolesService.create(body)
  }

  @Post('seed')
  async seed() {
    await this.rolesService.seed()
    return { ok: true, message: 'Roles seeded' }
  }
}
