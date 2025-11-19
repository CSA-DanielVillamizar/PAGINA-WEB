import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { VehiclesService } from './vehicles.service'

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  async findAll() {
    return this.vehiclesService.findAll()
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.vehiclesService.findByUser(userId)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id)
  }

  @Post()
  async create(@Body() body: any) {
    return this.vehiclesService.create(body)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.vehiclesService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.vehiclesService.delete(id)
  }

  @Post(':id/transfer')
  async transfer(@Param('id') id: string, @Body('newUserId') newUserId: string) {
    return this.vehiclesService.transferOwner(id, newUserId)
  }
}
