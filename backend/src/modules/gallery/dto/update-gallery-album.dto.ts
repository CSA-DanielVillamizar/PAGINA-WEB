import { IsString, IsOptional, IsDateString, IsUUID, Length } from 'class-validator'

/**
 * DTO de actualización parcial de álbum.
 */
export class UpdateGalleryAlbumDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  titulo?: string

  @IsOptional()
  @IsString()
  descripcion?: string

  @IsOptional()
  @IsUUID()
  eventoId?: string

  @IsOptional()
  @IsDateString()
  fecha?: string
}
