import { Controller, Get, Post, Put, Delete, Body, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string
  ) {
    return this.subscriptionsService.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status,
      type,
      search
    })
  }

  @Get('stats')
  async getStats() {
    return this.subscriptionsService.stats()
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id)
  }

  @Post('subscribe')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async subscribe(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.subscribe(dto)
  }

  @Post('confirm/:token')
  async confirm(@Param('token') token: string) {
    return this.subscriptionsService.confirm(token)
  }

  @Post('resend-confirmation')
  async resendConfirmation(@Body('email') email: string) {
    return this.subscriptionsService.resendConfirmation(email)
  }

  @Post('unsubscribe')
  async unsubscribe(@Body('correo') correo: string) {
    return this.subscriptionsService.unsubscribe(correo)
  }

  @Get('unsubscribe/:token')
  async unsubscribeByToken(@Param('token') token: string) {
    return this.subscriptionsService.unsubscribeByToken(token)
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, dto)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.subscriptionsService.delete(id)
  }
}

