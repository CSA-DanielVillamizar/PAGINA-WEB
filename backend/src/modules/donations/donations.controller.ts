import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { DonationsService } from './donations.service'

@Controller('donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Get()
  async findAll() {
    return this.donationsService.findAll()
  }

  @Get('total')
  async getTotal() {
    return this.donationsService.getTotalDonations()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.donationsService.findOne(id)
  }

  @Post()
  async create(@Body() body: any) {
    return this.donationsService.create(body)
  }
}
