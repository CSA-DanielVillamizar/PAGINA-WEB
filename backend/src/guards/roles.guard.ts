import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard que verifica si el usuario tiene los roles necesarios para acceder a un endpoint.
 * Debe usarse junto con el decorator @Roles().
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos del metadata del endpoint
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario del request (inyectado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario, denegar acceso
    if (!user) {
      throw new ForbiddenException('No se encontró información del usuario');
    }

    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const userRoles = user.roles?.map((role: any) => role.name) || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
