# Backend API – Fundación L.A.M.A. Medellín

Requisitos:
- Node.js 20+
- PostgreSQL 13+

Pasos iniciales:
1. Copia `.env.example` a `.env` y ajusta valores
2. Instala dependencias: `npm i`
3. Genera cliente Prisma: `npm run prisma:generate`
4. Crea migraciones: `npm run prisma:migrate`
5. Levanta en desarrollo: `npm run dev`

Endpoints base:
- `GET /health` – estado del servicio
- `POST /api/auth/registro`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/password/reset/request`
- `POST /api/auth/password/reset/confirm`
- `GET/POST/PUT/DELETE /api/users`

Estructura de carpetas sigue principios de Clean Architecture: separación en `config`, `middlewares`, `modules`, `utils`.
