import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard JWT que protege rutas requiriendo un token JWT válido.
 * Extiende AuthGuard de Passport para validar tokens.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Llamar a la implementación base de Passport
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Si hay error o no hay usuario, lanzar excepción
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
