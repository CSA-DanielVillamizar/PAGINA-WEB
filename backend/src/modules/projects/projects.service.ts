import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeaturedProject } from './entities/featured-project.entity';
import { CreateFeaturedProjectDto } from './dto/create-featured-project.dto';
import { UpdateFeaturedProjectDto } from './dto/update-featured-project.dto';

/**
 * Servicio de proyectos destacados
 * Gestión CRUD completa de proyectos sociales
 */
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(FeaturedProject)
    private readonly repo: Repository<FeaturedProject>
  ) {}

  /**
   * Listar todos los proyectos con filtros opcionales
   */
  async findAll(tipo?: string, estado?: string) {
    const query = this.repo.createQueryBuilder('project');

    if (tipo) {
      query.andWhere('project.tipo = :tipo', { tipo });
    }

    if (estado) {
      query.andWhere('project.estado = :estado', { estado });
    }

    query.orderBy('project.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Obtener un proyecto por ID
   */
  async findOne(id: string) {
    const project = await this.repo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    return project;
  }

  /**
   * Crear nuevo proyecto
   */
  async create(dto: CreateFeaturedProjectDto) {
    const project = this.repo.create({
      ...dto,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
    });
    return this.repo.save(project);
  }

  /**
   * Actualizar proyecto existente
   */
  async update(id: string, dto: UpdateFeaturedProjectDto) {
    const project = await this.findOne(id);

    const updateData: any = { ...dto };
    if (dto.fechaInicio) {
      updateData.fechaInicio = new Date(dto.fechaInicio);
    }
    if (dto.fechaFin) {
      updateData.fechaFin = new Date(dto.fechaFin);
    }

    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Eliminar proyecto
   */
  async remove(id: string) {
    const project = await this.findOne(id);
    await this.repo.remove(project);
    return { message: 'Proyecto eliminado exitosamente' };
  }

  /**
   * Obtener estadísticas de proyectos
   */
  async getStats() {
    const total = await this.repo.count();
    const enCurso = await this.repo.count({ where: { estado: 'En curso' } });
    const finalizados = await this.repo.count({ where: { estado: 'Finalizado' } });
    const proximos = await this.repo.count({ where: { estado: 'Próximo' } });

    const beneficiariosResult = await this.repo
      .createQueryBuilder('project')
      .select('SUM(project.beneficiarios)', 'total')
      .getRawOne();

    return {
      total,
      enCurso,
      finalizados,
      proximos,
      totalBeneficiarios: parseInt(beneficiariosResult?.total || '0', 10),
    };
  }
}
