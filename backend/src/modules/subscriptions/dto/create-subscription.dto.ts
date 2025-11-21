import { IsEmail, IsString, IsOptional, IsUUID, Length } from 'class-validator'

/**
 * DTO de creación de suscripción.
 */
export class CreateSubscriptionDto {
  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string

  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsUUID()
  userId?: string
}
