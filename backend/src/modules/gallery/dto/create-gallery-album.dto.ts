import { IsString, IsOptional, IsDateString, IsUUID, Length } from 'class-validator'

/**
 * DTO de creación de álbum de galería.
 * Valida los campos necesarios para crear un nuevo álbum fotográfico.
 */
export class CreateGalleryAlbumDto {
  @IsString()
  @Length(3, 255)
  titulo: string

  @IsOptional()
  @IsString()
  descripcion?: string

  @IsOptional()
  @IsUUID()
  eventoId?: string

  @IsDateString()
  fecha: string
}
