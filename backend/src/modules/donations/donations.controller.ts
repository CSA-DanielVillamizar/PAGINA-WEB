import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe } from '@nestjs/common'
import { DonationsService } from './donations.service'
import { CreateDonationDto } from './dto/create-donation.dto'
import { UpdateDonationDto } from './dto/update-donation.dto'

@Controller('donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
  ) {
    return this.donationsService.findAll({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      userId,
      dateFrom,
      dateTo,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    })
  }

  @Get('total')
  async getTotal() {
    return this.donationsService.getTotalDonations()
  }

  @Get('stats')
  async stats() {
    return this.donationsService.stats()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id)
  }

  @Post()
  async create(@Body(new ValidationPipe({ transform: true, whitelist: true })) body: CreateDonationDto) {
    return this.donationsService.create(body)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) body: UpdateDonationDto
  ) {
    return this.donationsService.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.donationsService.delete(id)
  }

  @Post(':id/receipt')
  async generateReceipt(@Param('id') id: string) {
    const url = await this.donationsService.generateReceipt(id)
    return { receiptUrl: url }
  }
}
