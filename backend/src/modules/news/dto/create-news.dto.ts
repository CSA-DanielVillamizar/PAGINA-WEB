import { IsString, IsOptional, IsUUID, IsArray, Length } from 'class-validator'

/**
 * DTO de creación de noticia.
 * Valida los campos necesarios para crear una nueva noticia.
 */
export class CreateNewsDto {
  @IsString()
  @Length(3, 255)
  title: string

  @IsString()
  @Length(10, 10000)
  content: string

  @IsOptional()
  @IsString()
  @Length(10, 500)
  excerpt?: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsUUID()
  authorId?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
