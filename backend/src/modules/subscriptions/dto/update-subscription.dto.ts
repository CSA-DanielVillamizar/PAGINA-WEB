import { IsString, IsOptional, Length } from 'class-validator'

/**
 * DTO de actualización parcial de suscripción.
 */
export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  status?: string
}
