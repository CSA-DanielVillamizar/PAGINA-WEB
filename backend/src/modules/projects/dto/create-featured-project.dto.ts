import { IsString, IsOptional, IsIn, IsInt, Min, IsArray, IsDateString } from 'class-validator';

/**
 * DTO para crear un proyecto destacado
 * Solo accesible por roles de junta
 */
export class CreateFeaturedProjectDto {
  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;

  @IsString()
  @IsIn(['salud', 'educacion', 'comunitario', 'acompanamiento'])
  tipo: string;

  @IsString()
  @IsIn(['En curso', 'Finalizado', 'Próximo'])
  estado: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  beneficiarios?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
