import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { SouvenirsService } from './souvenirs.service'

@Controller('souvenirs')
export class SouvenirsController {
  constructor(private souvenirsService: SouvenirsService) {}

  @Get()
  async findAll() {
    return this.souvenirsService.findAll()
  }

  @Get('category/:categoria')
  async findByCategory(@Param('categoria') categoria: string) {
    return this.souvenirsService.findByCategory(categoria)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.souvenirsService.findOne(id)
  }

  @Post()
  async create(@Body() body: any) {
    return this.souvenirsService.create(body)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.souvenirsService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.souvenirsService.delete(id)
  }

  @Post(':id/inventory')
  async updateInventory(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.souvenirsService.updateInventory(id, quantity)
  }
}
