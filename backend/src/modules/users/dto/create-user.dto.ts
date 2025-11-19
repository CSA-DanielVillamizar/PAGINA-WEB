import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ArrayNotEmpty, IsArray } from 'class-validator'

/** DTO para creación de usuario */
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  nombreCompleto: string

  @IsEmail()
  correo: string

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[]
}
