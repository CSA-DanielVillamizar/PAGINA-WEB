import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { FeaturedProject } from './entities/featured-project.entity';

/**
 * Módulo de proyectos destacados
 * Gestión CRUD de proyectos sociales con restricción de acceso por roles
 */
@Module({
  imports: [TypeOrmModule.forFeature([FeaturedProject])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
