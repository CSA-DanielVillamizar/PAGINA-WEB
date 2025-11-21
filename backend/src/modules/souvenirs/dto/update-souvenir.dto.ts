import { IsString, IsNumber, IsOptional, Min, Length, IsInt } from 'class-validator'

/**
 * DTO de actualización parcial de souvenir.
 */
export class UpdateSouvenirDto {
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsString()
  @Length(2, 100)
  category?: string

  @IsOptional()
  @IsString()
  status?: string
}
