# Sistema de Autenticación y Autorización Admin

## 📋 Resumen

Sistema completo de protección de rutas administrativas para la **Fundación L.A.M.A. Medellín**, implementado con enfoque **server-side first** siguiendo Clean Architecture.

---

## 🔐 Roles con Acceso Admin

Los siguientes roles tienen acceso completo al panel de administración (`/admin`):

| Rol               | Acceso Admin |
|-------------------|:------------:|
| Presidente        | ✔            |
| Vicepresidente    | ✔            |
| Secretario        | ✔            |
| Tesorero          | ✔            |
| Administrador     | ✔            |
| GerenciaNegocios  | ✔            |
| CommunityManager  | ✔            |
| MTO               | ✔            |
| **Miembro**       | ❌           |
| **Invitado**      | ❌           |

---

## 🛡️ Protección Backend

### Middleware `requireAdminRole`

Archivo: `backend/src/middlewares/admin-auth.ts`

**Funcionalidad:**
- Valida que el usuario esté autenticado (JWT válido).
- Verifica que el usuario tenga al menos uno de los roles administrativos.
- Devuelve `401 Unauthorized` si no hay JWT.
- Devuelve `403 Forbidden` si el usuario no tiene rol admin.

**Uso en routers:**
```typescript
import { requireAuth } from '../../middlewares/auth';
import { requireAdminRole } from '../../middlewares/admin-auth';

router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  // Solo usuarios con roles admin pueden crear recursos
});
```

### Rutas Protegidas

Todas las operaciones administrativas (POST, PUT, DELETE, y GET de listas completas) están protegidas en:

- **Miembros** (`/api/members`)
- **Vehículos** (`/api/vehicles`)
- **Eventos** (`/api/events`)
- **Souvenirs** (`/api/souvenirs`)
- **Noticias** (`/api/news`)
- **Suscripciones** (`/api/subscriptions`)
- **Donaciones** (`/api/donations`)
- **Inscripciones** (`/api/application-forms`)
- **Usuarios** (`/api/users`)

---

## 🌐 Protección Frontend

### Middleware de Next.js 14

Archivo: `frontend/middleware.ts`

**Funcionalidad:**
- Intercepta todas las peticiones a rutas `/admin/*`.
- Verifica JWT almacenado en cookie `auth_token`.
- Decodifica el token y valida los roles del usuario.
- Redirige según el caso:
  - **Sin token** → `/auth/login?error=unauthorized`
  - **Token expirado/inválido** → `/auth/login?error=token_expired`
  - **Sin rol admin** → `/denied`

**Configuración:**
```typescript
export const config = {
  matcher: ['/admin/:path*'],
};
```

### Página de Acceso Denegado

Archivo: `frontend/app/denied/page.tsx`

**Características:**
- Diseño institucional coherente con la Fundación L.A.M.A. Medellín.
- Mensaje claro de acceso denegado.
- Opciones de navegación:
  - Regresar al inicio.
  - Iniciar sesión con otra cuenta.
- Información de contacto con la Junta Directiva.

---

## 👤 Layout Admin con Usuario

### Componente `AdminHeader`

Archivo: `frontend/components/admin/AdminHeader.tsx`

**Muestra:**
- Nombre del usuario autenticado.
- Roles del usuario (ej: "Presidente, Administrador").
- Botón de **logout** funcional que:
  - Limpia tokens y usuario del estado Zustand.
  - Elimina cookies de autenticación.
  - Redirige a `/auth/login`.

**Integración:**
```typescript
// frontend/components/admin/AdminDashboard.tsx
import { AdminHeader } from "./AdminHeader";

export const AdminDashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      {/* Sidebar y contenido */}
    </div>
  );
};
```

---

## 🔄 Flujo de Autenticación

### 1️⃣ Login Exitoso
1. Usuario envía credenciales a `/api/auth/login`.
2. Backend valida y genera JWT con roles.
3. Frontend recibe tokens y los almacena en:
   - **Estado Zustand** (`accessToken`, `refreshToken`, `user`).
   - **Cookies** (`auth_token`, `refresh_token`).

### 2️⃣ Acceso a Panel Admin
1. Usuario navega a `/admin`.
2. **Middleware frontend** verifica JWT en cookie.
3. Si válido y con rol admin → acceso permitido.
4. Si no válido → redirige a login o `/denied`.

### 3️⃣ Petición a API Admin
1. Frontend envía petición con `Authorization: Bearer <token>`.
2. **Middleware backend** valida JWT y roles.
3. Si válido → procesa petición.
4. Si no válido → devuelve `401` o `403`.

### 4️⃣ Logout
1. Usuario hace clic en "Cerrar sesión".
2. Frontend elimina tokens y usuario del estado.
3. Frontend elimina cookies de autenticación.
4. Redirige a `/auth/login`.

---

## 🧪 Pruebas Manuales

### Escenario 1: Usuario Admin
1. Login con usuario que tiene rol `Presidente`.
2. Navegar a `/admin` → **acceso permitido**.
3. Header muestra nombre y rol.
4. Realizar operaciones CRUD → **éxito**.

### Escenario 2: Usuario Miembro
1. Login con usuario que solo tiene rol `Miembro`.
2. Navegar a `/admin` → **redirige a `/denied`**.
3. Intentar POST a `/api/members` → **403 Forbidden**.

### Escenario 3: Sin Autenticar
1. Navegar a `/admin` sin login → **redirige a `/auth/login?error=unauthorized`**.
2. Intentar GET `/api/users` sin token → **401 Unauthorized**.

### Escenario 4: Token Expirado
1. Login y esperar expiración del JWT (ej: 15 minutos).
2. Navegar a `/admin` → **redirige a `/auth/login?error=token_expired`**.
3. Intentar operación en API → **401 Token inválido**.

---

## 📦 Dependencias Agregadas

### Backend
- `jsonwebtoken`: Generación y verificación de JWT.
- `bcryptjs`: Hash de contraseñas.

### Frontend
- `jose`: Verificación de JWT en middleware de Next.js 14.
- `zustand`: Estado global para autenticación.

---

## 🚀 Próximos Pasos (Fase 2 - Continuación)

1. **Generación de PDF** para `ApplicationForm` con `pdfkit`.
2. **Envío de emails** con `nodemailer` (confirmaciones, notificaciones).
3. **Calendario interactivo** con `FullCalendar` para eventos.
4. **Componentes UI avanzados**:
   - Tablas con paginación y filtros.
   - Modales de confirmación.
   - Dark mode toggle.
   - Formularios dinámicos con React Hook Form + Zod.

---

## 📚 Documentación Técnica

### Estructura de JWT

```json
{
  "sub": "user-uuid",
  "email": "presidente@lama.org",
  "roles": ["Presidente", "Administrador"],
  "iat": 1700000000,
  "exp": 1700000900
}
```

### Variables de Entorno

**Backend** (`.env`):
```env
JWT_ACCESS_SECRET=tu-secret-key-muy-segura
JWT_REFRESH_SECRET=tu-refresh-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
JWT_ACCESS_SECRET=tu-secret-key-muy-segura
```

---

## ✅ Checklist de Implementación

- [x] Middleware backend `requireAdminRole`
- [x] Protección de todas las rutas admin en backend
- [x] Middleware frontend en `middleware.ts`
- [x] Página `/denied` con diseño institucional
- [x] Header admin con nombre, rol y logout
- [x] Store Zustand actualizado con `user` y `logout`
- [x] Documentación completa del sistema

---

**Fundación L.A.M.A. Medellín © 2025**
