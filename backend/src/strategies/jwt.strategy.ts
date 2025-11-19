import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../modules/users/user.entity';

/**
 * Estrategia JWT que valida tokens y carga el usuario desde la base de datos.
 * Passport ejecuta esta estrategia automáticamente cuando se usa JwtAuthGuard.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'lama-secret-key-2024',
    });
  }

  /**
   * Método que Passport ejecuta después de validar el token.
   * El payload contiene la información del usuario que fue codificada en el token.
   * 
   * @param payload - Datos decodificados del token JWT
   * @returns Usuario completo con relaciones de roles
   */
  async validate(payload: any) {
    const { sub: userId } = payload;

    // Buscar usuario con sus roles
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || user.estado !== 'ACTIVE') {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Este objeto se inyectará en request.user
    return user;
  }
}
