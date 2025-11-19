import { Controller, Get, Post, Body } from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  async findAll() {
    return this.subscriptionsService.findAll()
  }

  @Post('subscribe')
  async subscribe(@Body('correo') correo: string) {
    return this.subscriptionsService.subscribe(correo)
  }

  @Post('unsubscribe')
  async unsubscribe(@Body('correo') correo: string) {
    return this.subscriptionsService.unsubscribe(correo)
  }
}
