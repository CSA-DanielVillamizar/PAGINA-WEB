# 🏍️ Fundación L.A.M.A. Medellín - Plataforma Web Adventure

<div align="center">

![Estado](https://img.shields.io/badge/Estado-Producci%C3%B3n-success?style=for-the-badge)
![UI](https://img.shields.io/badge/UI-Adventure%20Premium-FFD200?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript)

**Mototurismo con propósito. Cultura que deja huella.**

[Demo en Vivo](#) • [Documentación](#) • [Reporte de Bugs](#)

</div>

---

## 📖 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)
- [Seguridad](#-seguridad)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Descripción

Plataforma web institucional de la **Fundación L.A.M.A. Medellín**, diseñada con una identidad visual **Adventure** premium que refleja la pasión por el mototurismo y el compromiso social.

### Características Destacadas

- 🎨 **Diseño Adventure**: Tema oscuro con amarillo neón (#FFD200) y efectos glow
- 🔐 **Autenticación Robusta**: JWT con roles y permisos granulares
- 📱 **Responsive**: Optimizada para desktop, tablet y mobile
- ⚡ **Performance**: Next.js 14 con Server Components
- 🎭 **Animaciones**: Framer Motion para experiencia cinematográfica
- 📧 **Emails**: Sistema de notificaciones automáticas con nodemailer
- 📄 **PDF**: Generación de formularios institucionales con pdfkit
- 📅 **Calendario**: FullCalendar para eventos y rodadas

---

## ✨ Características Principales

### Para Usuarios Públicos
- 🏠 **Home Adventure**: Hero cinematográfico con animaciones
- 📰 **Noticias**: Últimas novedades de la Fundación
- 📅 **Eventos**: Calendario interactivo de rodadas
- 🛍️ **Souvenirs**: Merchandising oficial
- 💰 **Donaciones**: Sistema de aportes voluntarios
- 📝 **Inscripción**: Formulario para aspirantes a miembros

### Para Administradores
- 📊 **Dashboard**: KPIs y métricas en tiempo real
- 👥 **Gestión de Miembros**: CRUD completo con roles
- 🏍️ **Vehículos**: Registro y administración de motos
- 📆 **Eventos**: Creación y gestión de rodadas
- 📰 **Noticias**: Sistema de publicaciones
- 📧 **Notificaciones**: Emails automáticos
- 📄 **Reportes**: Generación de PDF institucionales

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)             │
│  ┌──────────────────────────────────────────────┐   │
│  │  App Router + Server Components              │   │
│  │  • /auth/login (Autenticación)               │   │
│  │  • / (Home Adventure)                        │   │
│  │  • /admin/* (Panel protegido)                │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Middleware (Protección de rutas)            │   │
│  │  • JWT Verification con jose                 │   │
│  │  • Role-based Access Control                 │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  State Management (Zustand)                  │   │
│  │  • Auth Store (user, token)                  │   │
│  │  • Persist middleware                        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                          ↕ HTTP / REST API
┌─────────────────────────────────────────────────────┐
│              BACKEND (Express + TypeScript)         │
│  ┌──────────────────────────────────────────────┐   │
│  │  API Routes                                  │   │
│  │  • /api/auth (Login, Register, Refresh)     │   │
│  │  • /api/members (CRUD Miembros)              │   │
│  │  • /api/vehicles (CRUD Vehículos)            │   │
│  │  • /api/events (CRUD Eventos)                │   │
│  │  • /api/news (CRUD Noticias)                 │   │
│  │  • /api/application-forms (Inscripciones)   │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Middlewares                                 │   │
│  │  • Authentication (JWT verify)               │   │
│  │  • Authorization (requireAdminRole)          │   │
│  │  • Error Handling                            │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  Services                                    │   │
│  │  • PDFService (pdfkit)                       │   │
│  │  • EmailService (nodemailer)                 │   │
│  │  • StorageService (Azure Blob opcional)     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                          ↕ TypeORM / Prisma
┌─────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                  │
│  • Users (Usuarios y autenticación)                 │
│  • Members (Miembros de la Fundación)               │
│  • Vehicles (Motocicletas registradas)              │
│  • Events (Eventos y rodadas)                       │
│  • News (Noticias)                                  │
│  • Souvenirs (Productos)                            │
│  • ApplicationForms (Solicitudes de inscripción)    │
│  • Donations (Donaciones)                           │
│  • Subscriptions (Suscripciones a newsletter)       │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.2.0 | Framework React con SSR |
| **React** | 18.2.0 | Librería de UI |
| **TypeScript** | 5.6.3 | Tipado estático |
| **Tailwind CSS** | 3.4.1 | Estilos utility-first |
| **Framer Motion** | 11.0.0 | Animaciones fluidas |
| **Zustand** | 4.5.2 | State management |
| **jose** | 5.2.0 | JWT verification (Edge) |
| **Lucide React** | 0.363.0 | Iconos modernos |
| **FullCalendar** | 6.1.10 | Calendario de eventos |
| **Radix UI** | Latest | Componentes accesibles |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Express** | Latest | Framework HTTP |
| **TypeScript** | 5.6.3 | Tipado estático |
| **Prisma** | Latest | ORM para PostgreSQL |
| **jsonwebtoken** | Latest | Autenticación JWT |
| **bcrypt** | Latest | Hash de contraseñas |
| **pdfkit** | Latest | Generación de PDF |
| **nodemailer** | Latest | Envío de emails |
| **joi** / **zod** | Latest | Validación de datos |

### Infraestructura
- **PostgreSQL** 15+ (Base de datos)
- **Azure Static Web Apps** (Frontend hosting)
- **Azure App Service** (Backend hosting)
- **Azure Blob Storage** (Almacenamiento de archivos)
- **GitHub Actions** (CI/CD)

---

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+ y npm 9+
- PostgreSQL 15+
- Git

### 1. Clonar el Repositorio

```powershell
git clone https://github.com/CSA-DanielVillamizar/PAGINA-WEB.git
cd PAGINA-WEB/apps/lama-monorepo
```

### 2. Instalar Dependencias

```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurar Variables de Entorno

#### Backend (`.env`)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lama_db"

# JWT
JWT_ACCESS_SECRET="tu-secret-key-muy-segura-cambiar-en-produccion"
JWT_REFRESH_SECRET="tu-refresh-secret-key-cambiar-en-produccion"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# SMTP Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password-de-aplicacion"
SMTP_FROM="no-reply@fundacionlamamedellin.org"

# Azure Storage (Opcional)
AZURE_STORAGE_CONNECTION_STRING="..."
AZURE_STORAGE_CONTAINER_NAME="lama-files"
```

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
JWT_ACCESS_SECRET="tu-secret-key-muy-segura-cambiar-en-produccion"
```

### 4. Ejecutar Migraciones

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. Iniciar Servidores

```powershell
# Backend (puerto 3000)
cd backend
npm run dev

# Frontend (puerto 3001)
cd ../frontend
npm run dev
```

**Acceso:** http://localhost:3001

---

## ⚙️ Configuración

### Roles de Usuario

La plataforma soporta los siguientes roles:

| Rol | Permisos | Acceso Admin |
|-----|----------|--------------|
| **Presidente** | Completo | ✅ |
| **Vicepresidente** | Completo | ✅ |
| **Secretario** | Gestión documental | ✅ |
| **Tesorero** | Finanzas y donaciones | ✅ |
| **Administrador** | Sistema completo | ✅ |
| **GerenciaNegocios** | Eventos y souvenirs | ✅ |
| **CommunityManager** | Noticias y redes | ✅ |
| **MTO** | Vehículos y mecánica | ✅ |
| **Miembro** | Solo lectura | ❌ |
| **Invitado** | Solo lectura | ❌ |

### Configurar SMTP (Gmail ejemplo)

1. Habilitar verificación en 2 pasos en Google
2. Generar "Contraseña de aplicación"
3. Usar en `SMTP_PASS`

---

## 📁 Estructura del Proyecto

```
apps/lama-monorepo/
├── backend/
│   ├── src/
│   │   ├── modules/          # Módulos de dominio
│   │   │   ├── members/
│   │   │   ├── vehicles/
│   │   │   ├── events/
│   │   │   └── ...
│   │   ├── middlewares/      # Auth, roles, errors
│   │   ├── services/         # PDF, Email, Storage
│   │   ├── guards/           # JWT, Roles guards
│   │   └── migrations/       # Migraciones DB
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── expired/
│   │   ├── admin/            # Panel protegido
│   │   │   ├── miembros/
│   │   │   ├── vehiculos/
│   │   │   └── ...
│   │   ├── page.tsx          # Home Adventure
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # Componentes reutilizables
│   │   ├── admin/            # Componentes admin
│   │   ├── layout/           # Navbar, Footer
│   │   └── loading/          # Spinners
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── store/
│   │   └── auth.ts
│   ├── middleware.ts         # Protección de rutas
│   └── package.json
├── infra/                    # Infraestructura Azure
│   ├── main.bicep
│   └── scripts/
└── docs/                     # Documentación
    ├── UX_UI_ADVENTURE_COMPLETE.md
    ├── ADMIN_AUTH_SYSTEM.md
    └── PHASE_2_COMPLETE.md
```

---

## 🧩 Componentes Principales

### Frontend

#### 🎨 UI Components (`components/ui/`)
- **LogoSpinner** - Llanta giratoria con glow
- **Input** - Input con validación visual
- **Toast** - Notificaciones globales
- **Avatar** - Avatar con iniciales
- **Button** - Botón Adventure
- **Dialog** - Modales Radix UI
- **Table** - Tabla responsive

#### 🔐 Auth Components (`app/auth/`)
- **LoginPage** - Login Adventure animado
- **ExpiredPage** - Página de sesión expirada
- **DeniedPage** - Acceso denegado

#### 🧭 Layout Components (`components/layout/`)
- **Navbar** - Navegación institucional
- **Footer** - Footer corporativo
- **AdminSidebar** - Sidebar del panel

#### 🎛️ Admin Components (`app/admin/`)
- **AdminPage** - Dashboard con KPIs
- **MiembrosAdminTable** - Tabla de miembros
- **EventosAdminTable** - Tabla de eventos
- **VehiculosAdminTable** - Tabla de vehículos

### Backend

#### 📦 Services (`src/services/`)
- **PDFService** - Generación de PDF institucionales
- **EmailService** - Envío de emails con templates
- **StorageService** - Almacenamiento de archivos

#### 🛡️ Middlewares (`src/middlewares/`)
- **auth** - Verificación JWT
- **admin-auth** - Verificación de roles admin
- **error-handler** - Manejo global de errores

---

## 🔒 Seguridad

### Autenticación
- JWT con tokens de acceso (15 min) y refresh (7 días)
- Cookies HttpOnly + Secure en producción
- Verificación en edge con `jose`

### Autorización
- Middleware `requireAdminRole` en backend
- Middleware Next.js para rutas `/admin/*`
- Role-based Access Control (RBAC)

### Validación
- Validación de dominio institucional: `@fundacionlamamedellin.org`
- Sanitización de inputs con joi/zod
- Rate limiting en endpoints sensibles

### Sesión
- Timeout automático después de 15 min inactividad
- Advertencia 2 min antes del cierre
- Limpieza de cookies y storage en logout

---

## 🚢 Despliegue

### Frontend (Azure Static Web Apps)

```powershell
cd frontend
npm run build
# Deploy automático con GitHub Actions
```

### Backend (Azure App Service)

```powershell
cd backend
npm run build
# Deploy con Azure CLI o GitHub Actions
```

### Base de Datos

```powershell
# Producción: Azure Database for PostgreSQL
# Ejecutar migraciones
npm run prisma:migrate:deploy
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Convenciones

- **Commits**: Conventional Commits (feat, fix, docs, style, refactor)
- **Código**: Clean Architecture, SOLID principles
- **Documentación**: Español técnico con JSDoc
- **Tests**: Jest para backend, React Testing Library para frontend

---

## 📄 Licencia

Este proyecto es propiedad de la **Fundación L.A.M.A. Medellín**.  
Todos los derechos reservados © 2025.

---

## 📞 Soporte

- **Email**: soporte@fundacionlamamedellin.org
- **Web**: https://fundacionlamamedellin.org
- **GitHub Issues**: [Reportar bug](https://github.com/CSA-DanielVillamizar/PAGINA-WEB/issues)

---

<div align="center">

**Hecho con ❤️ y ☕ por el equipo de L.A.M.A. Medellín**

🏍️ **Mototurismo con propósito** 🏍️

</div>
