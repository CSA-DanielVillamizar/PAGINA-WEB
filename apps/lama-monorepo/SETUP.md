# Script de inicialización del monorepo L.A.M.A.

## ⚠️ IMPORTANTE: Si encuentras errores SSL con Prisma

Si `npm run prisma:generate` falla por certificados SSL, ejecuta:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
cd apps\lama-monorepo\backend
npm run prisma:generate
npm run prisma:migrate
$env:NODE_TLS_REJECT_UNAUTHORIZED="1"
```

## Pasos de inicialización

### 1. Backend
```powershell
cd apps\lama-monorepo\backend

# Instalar (ya hecho)
npm install

# Configurar .env (ya creado, ajusta DATABASE_URL si es necesario)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/lama_db?schema=public"

# Generar Prisma client
npm run prisma:generate

# Crear base de datos y migraciones
npm run prisma:migrate

# Iniciar servidor de desarrollo
npm run dev
# Escucha en http://localhost:8080
```

### 2. Frontend
```powershell
cd apps\lama-monorepo\frontend

# Instalar (ya hecho)
npm install

# Configurar .env.local (ya creado)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Iniciar servidor de desarrollo
npm run dev
# Escucha en http://localhost:3000
```

## Endpoints disponibles

### Backend API (http://localhost:8080/api)
- **Auth**: POST /auth/registro, POST /auth/login, POST /auth/refresh, POST /auth/password/reset/request, POST /auth/password/reset/confirm
- **Users**: GET/POST/PUT/DELETE /users
- **Members**: GET/POST/PUT/DELETE /members
- **Vehicles**: GET/POST/PUT/DELETE /vehicles
- **Events**: GET/POST/PUT/DELETE /events
- **Souvenirs**: GET/POST/PUT/DELETE /souvenirs
- **News**: GET/POST/PUT/DELETE /news
- **Subscriptions**: GET/POST /subscriptions
- **Donations**: GET/POST /donations
- **Application Forms**: GET/POST /application-forms

### Frontend (http://localhost:3000)
- **Home**: /
- **Sobre Nosotros**: /sobre-nosotros
- **Miembros**: /miembros
- **Souvenirs**: /souvenirs
- **Noticias**: /noticias
- **Inscripción**: /inscripcion

## Siguiente fase: Admin Panel

Falta implementar:
- Panel de administración en `/admin`
- Componentes UI completos (cards, tablas, modales, forms)
- Generación de PDF para ApplicationForm
- Envío de emails con nodemailer
- Calendario con FullCalendar
- Dark mode toggle
