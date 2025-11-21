import { IsString, IsOptional, IsUUID, IsDateString, IsArray, Length } from 'class-validator'

/**
 * DTO de actualización parcial de noticia.
 */
export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title?: string

  @IsOptional()
  @IsString()
  @Length(10, 10000)
  content?: string

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
  @IsDateString()
  publishedAt?: string

  @IsOptional()
  @IsUUID()
  authorId?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}
