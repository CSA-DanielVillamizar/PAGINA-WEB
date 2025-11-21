import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFiles, ValidationPipe } from '@nestjs/common'
import { VehiclesService } from './vehicles.service'
import { CreateVehicleDto } from './dto/create-vehicle.dto'
import { UpdateVehicleDto } from './dto/update-vehicle.dto'
import { FilesInterceptor } from '@nestjs/platform-express'

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
    @Query('year') year?: string,
    @Query('search') search?: string,
  ) {
    return this.vehiclesService.findAll({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      brand,
      model,
      year: year ? parseInt(year) : undefined,
      search,
    })
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.vehiclesService.findByUser(userId)
  }

  @Get('stats')
  async stats() {
    return this.vehiclesService.stats()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id)
  }

  @Post()
  async create(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: CreateVehicleDto) {
    return this.vehiclesService.create(body)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) body: UpdateVehicleDto
  ) {
    return this.vehiclesService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.vehiclesService.delete(id)
  }

  @Post(':id/transfer')
  async transfer(
    @Param('id') id: string,
    @Body('newUserId') newUserId: string
  ) {
    return this.vehiclesService.transferOwner(id, newUserId)
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.vehiclesService.addImages(id, files)
  }
}
