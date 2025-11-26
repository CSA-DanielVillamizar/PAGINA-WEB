# Frontend Next.js 14 - Fundación L.A.M.A. Medellín

Estructura inicial creada para migrar gradualmente desde el frontend React (Vite) existente hacia Next.js 14 con App Router.

## Características Incluidas
- Next.js 14 App Router
- TailwindCSS (configuración base)
- React Query (Tanstack) para data fetching
- Zustand para estado global ligero
- React Hook Form + Zod para validaciones (por integrar en formularios)
- Proveedor de autenticación con almacenamiento de access/refresh tokens

## Variables de Entorno
Configurar las siguientes (ejemplo `.env.local`):
```
NEXT_PUBLIC_API_BASE=https://lama-backend-dev.azurewebsites.net/api
```
(No se modifican las variables del backend.)

## Scripts
```
npm install
npm run dev
npm run build
npm start
```

## Próximos Pasos
1. Implementar páginas públicas restantes.
2. Añadir componentes UI (shadcn/ui) y navegación accesible.
3. Middleware para proteger rutas /admin.
4. Integrar formularios (registro, confirmación, reset password) con endpoints recién creados.
5. Añadir manejo automático de refresh token (interceptor axios). 

## Nota
Este scaffolding convive con el frontend actual (Vite) sin romper su operación.
