import { PartialType } from '@nestjs/mapped-types';
import { CreateFeaturedProjectDto } from './create-featured-project.dto';

/**
 * DTO para actualizar un proyecto destacado
 * Todos los campos son opcionales
 */
export class UpdateFeaturedProjectDto extends PartialType(CreateFeaturedProjectDto) {}
