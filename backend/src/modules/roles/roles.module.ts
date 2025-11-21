import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './role.entity'
import { RolesService } from './roles.service'
import { RolesController } from './roles.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService]
})
export class RolesModule implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  /** Al iniciar el módulo se asegura que los roles oficiales existan. */
  async onModuleInit() {
    await this.rolesService.seed();
  }
}
