import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { SouvenirsService } from './souvenirs.service'
import { CreateSouvenirDto } from './dto/create-souvenir.dto'
import { UpdateSouvenirDto } from './dto/update-souvenir.dto'
import { AdjustInventoryDto } from './dto/adjust-inventory.dto'

@Controller('souvenirs')
export class SouvenirsController {
  constructor(private souvenirsService: SouvenirsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
    @Query('search') search?: string
  ) {
    return this.souvenirsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      category,
      status,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      search
    })
  }

  @Get('stats')
  async getStats() {
    return this.souvenirsService.stats()
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
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: CreateSouvenirDto) {
    return this.souvenirsService.create(dto)
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateSouvenirDto) {
    return this.souvenirsService.update(id, dto)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.souvenirsService.delete(id)
  }

  @Post(':id/inventory-adjust')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async adjustInventory(@Param('id') id: string, @Body() dto: AdjustInventoryDto) {
    return this.souvenirsService.adjustInventory(id, dto)
  }

  @Post(':id/inventory')
  async updateInventory(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.souvenirsService.updateInventory(id, quantity)
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.souvenirsService.uploadImage(id, file)
    return { ok: true, imageUrl }
  }
}
