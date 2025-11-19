import { IsEmail, IsOptional, IsString, MinLength, IsArray } from 'class-validator'

/** DTO para actualización parcial de usuario */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombreCompleto?: string

  @IsOptional()
  @IsEmail()
  correo?: string

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[]

  @IsOptional()
  @IsString()
  estado?: string
}
