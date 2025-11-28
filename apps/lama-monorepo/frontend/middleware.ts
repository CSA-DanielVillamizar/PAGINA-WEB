import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Roles permitidos para acceder al panel de administración.
 */
const ADMIN_ROLES = [
  'Presidente',
  'Vicepresidente',
  'Secretario',
  'Tesorero',
  'Administrador',
  'GerenciaNegocios',
  'CommunityManager',
  'MTO'
];

/**
 * Middleware de Next.js 14 para proteger rutas administrativas.
 * Verifica JWT en cookies y valida roles de usuario.
 * 
 * Estados de error para UX:
 * - unauthorized: No hay token (mostrar "⚠ Debes iniciar sesión para continuar")
 * - token_expired: Token expirado (redirigir a /auth/expired)
 * - access_denied: Sin rol admin (redirigir a /denied con "🔒 Acceso restringido")
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // No hay token, redirigir a login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set('redirect', pathname); // Guardar ruta destino
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verificar JWT
      const secret = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || 'secret-key-change-in-production'
      );
      const { payload } = await jwtVerify(token, secret);

      // Validar roles
      const userRoles = (payload.roles as string[]) || [];
      const hasAdminRole = userRoles.some((role) => ADMIN_ROLES.includes(role));

      if (!hasAdminRole) {
        // Usuario autenticado pero sin rol admin
        const deniedUrl = new URL('/denied', request.url);
        deniedUrl.searchParams.set('reason', 'insufficient_permissions');
        return NextResponse.redirect(deniedUrl);
      }

      // Usuario autorizado, continuar
      return NextResponse.next();
    } catch (error: any) {
      // Token inválido o expirado
      if (error.code === 'ERR_JWT_EXPIRED') {
        // Token expirado, redirigir a página de expiración
        return NextResponse.redirect(new URL('/auth/expired', request.url));
      }
      
      // Otros errores de JWT (token inválido, manipulado, etc.)
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/**
 * Configuración de rutas protegidas.
 * El middleware solo se ejecuta en rutas que coincidan con este patrón.
 */
export const config = {
  matcher: ['/admin/:path*'],
};
