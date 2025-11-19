import { SetMetadata } from '@nestjs/common';

/**
 * Clave para almacenar los roles requeridos en el metadata de un endpoint.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator que especifica qué roles pueden acceder a un endpoint.
 * Debe usarse junto con RolesGuard.
 * 
 * @example
 * @Roles('Administrador', 'Presidente')
 * @Get()
 * findAll() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
