import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator que extrae el usuario actual del request.
 * El usuario es inyectado por JwtAuthGuard después de validar el token.
 * 
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
