import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateFeaturedProjectDto } from './dto/create-featured-project.dto';
import { UpdateFeaturedProjectDto } from './dto/update-featured-project.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

/**
 * Controlador de proyectos destacados
 * GET público para listar proyectos
 * POST/PATCH/DELETE solo para roles de junta (Presidente, Vicepresidente, Secretario, Tesorero)
 */
@Controller('featured-projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  /**
   * GET /featured-projects
   * Público: listar todos los proyectos
   * Query params: ?tipo=salud&estado=En curso
   */
  @Get()
  findAll(@Query('tipo') tipo?: string, @Query('estado') estado?: string) {
    return this.service.findAll(tipo, estado);
  }

  /**
   * GET /featured-projects/stats
   * Público: obtener estadísticas de proyectos
   */
  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  /**
   * GET /featured-projects/:id
   * Público: obtener un proyecto por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * POST /featured-projects
   * RESTRINGIDO: solo roles de junta
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Presidente', 'Vicepresidente', 'Secretario', 'Tesorero')
  create(@Body() dto: CreateFeaturedProjectDto) {
    return this.service.create(dto);
  }

  /**
   * PATCH /featured-projects/:id
   * RESTRINGIDO: solo roles de junta
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Presidente', 'Vicepresidente', 'Secretario', 'Tesorero')
  update(@Param('id') id: string, @Body() dto: UpdateFeaturedProjectDto) {
    return this.service.update(id, dto);
  }

  /**
   * DELETE /featured-projects/:id
   * RESTRINGIDO: solo roles de junta
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Presidente', 'Vicepresidente', 'Secretario', 'Tesorero')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
