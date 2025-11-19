# Fundación L.A.M.A. Medellín - Sistema Web Completo

Sistema web full-stack desarrollado para la Fundación L.A.M.A. (Liga Anti-Motociclismo Aburrido) Medellín, con autenticación Microsoft Entra ID, gestión de miembros, eventos, souvenirs, y portal administrativo.

## 🏗️ Arquitectura del Proyecto

```
WebPageLAMAMedellinFoundation/
├── frontend/          # React + TypeScript + Vite + TailwindCSS
├── backend/           # NestJS + TypeORM + PostgreSQL/Azure SQL
└── infrastructure/    # Azure Pipelines + Bicep templates
```

## 🎯 Características Principales

### Frontend (React + TypeScript)
- ✅ **10 páginas públicas**: Inicio, Nosotros, Moto-Touring, Miembros, Souvenirs, Noticias, Galería, Donaciones, Suscripciones, Formulario de Inscripción
- ✅ **Portal administrativo** con sidebar y rutas protegidas
- ✅ **Gestión de usuarios** (asignación de roles)
- ✅ **Calendario de eventos** con FullCalendar
- ✅ **Gestión de inventario** de souvenirs
- ✅ **Editor de noticias** (CRUD completo)
- ✅ **Galería de fotos** con álbumes
- ✅ **Generación de reportes** (CSV/PDF)
- ✅ **Zustand store** para autenticación y estado global
- ✅ **Axios interceptors** para manejo de tokens
- ✅ **Diseño responsive** con TailwindCSS

### Backend (NestJS + TypeORM)
- ✅ **11 entidades** con relaciones TypeORM: User, Role, MemberProfile, Vehicle, Event, Souvenir, News, Donation, Subscription, GalleryAlbum, ApplicationForm
- ✅ **11 módulos** con servicios y controladores CRUD completos
- ✅ **Autenticación Microsoft Entra ID** con restricción de dominio (@fundacionlamamedellin.org)
- ✅ **10 roles RBAC**: Presidente, Vicepresidente, Secretario, Tesorero, GerenciaNegocios, MTO, Administrador, CommunityManager, Miembro, Invitado
- ✅ **Azure Blob Storage** para carga de archivos
- ✅ **Azure Communication Services** para envío de emails
- ✅ **Generación de PDFs** con PDFKit
- ✅ **Swagger/OpenAPI** en `/api/docs`
- ✅ **Validación de DTOs** con class-validator
- ✅ **CORS configurado** para frontend

### DevOps & Infraestructura
- ✅ **Azure Pipelines** con build multi-stage
- ✅ **Bicep templates** para Azure Storage (expandible a SQL, App Services, Key Vault)
- 🔄 **Dockerfile** (pendiente)
- 🔄 **Deployment tasks** (pendiente)

## 📋 Requisitos Previos

- **Node.js** 18+ ([https://nodejs.org](https://nodejs.org))
- **PostgreSQL** 14+ o acceso a **Azure SQL Database**
- **Git** ([https://git-scm.com](https://git-scm.com))
- **Cuenta Azure** con:
  - Blob Storage (para archivos)
  - Communication Services (para emails)
  - SQL Database (producción)
  - Microsoft Entra ID tenant (para autenticación)

## 🚀 Instalación Local

### 1. Clonar el repositorio

```powershell
git clone https://github.com/your-org/WebPageLAMAMedellinFoundation.git
cd WebPageLAMAMedellinFoundation
```

### 2. Backend Setup

```powershell
cd backend
npm install
```

**Configurar variables de entorno** - Crear archivo `.env` basado en `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=lama_medellin

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...

# Microsoft Entra ID
ENTRA_TENANT_ID=your-tenant-id
ENTRA_CLIENT_ID=your-client-id
ENTRA_CLIENT_SECRET=your-client-secret

# Application
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Iniciar servidor de desarrollo:**

```powershell
npm run start:dev
```

El backend estará en `http://localhost:3000` con Swagger en `http://localhost:3000/api/docs`

**Poblar roles iniciales** (ejecutar una sola vez):

```powershell
curl -X POST http://localhost:3000/api/roles/seed
```

### 3. Frontend Setup

```powershell
cd ../frontend
npm install
```

**Configurar variables de entorno** - Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

**Iniciar servidor de desarrollo:**

```powershell
npm run dev
```

El frontend estará en `http://localhost:5173`

## 📚 Estructura de la Base de Datos

### Entidades Principales

#### `users`
- Usuarios registrados con autenticación Microsoft Entra ID
- Columnas: `id`, `nombreCompleto`, `correo`, `usuario`, `passwordHash`, `telefono`, `genero`, `capitulo`, `estado`, `fechaRegistro`
- Relación `ManyToMany` con `roles`

#### `roles`
- Sistema RBAC con 10 roles predefinidos
- Columnas: `id`, `name`, `description`
- Seed incluye: Presidente, Vicepresidente, Secretario, Tesorero, GerenciaNegocios, MTO, Administrador, CommunityManager, Miembro, Invitado

#### `member_profiles`
- Perfiles extendidos de miembros del capítulo
- Columnas: `userId`, `cargoJunta`, `tipoMiembro`, `profesion`, `serviciosOfrecidos`, `biografia`, `fotoPerfilUrl`, `fechaIngreso`
- Relación `OneToOne` con `users`

#### `vehicles`
- Registro de motocicletas con historial de transferencias
- Columnas: `id`, `userId`, `marca`, `referencia`, `color`, `año`, `placa`, `estado`, `historialPropietarios` (jsonb)

#### `events`
- Calendario de eventos (rodadas, asambleas, rallys, etc.)
- Columnas: `id`, `titulo`, `descripcion`, `fecha`, `hora`, `capitulo`, `tipoEvento`, `ubicacion`, `estado`
- Tipos: Rodada, Asamblea, Aniversario, Rally, LAMA_Hierro, Ruta_Iconica

#### `souvenirs`
- Catálogo de productos oficiales
- Columnas: `id`, `nombre`, `descripcion`, `precio`, `imagenUrl`, `inventario`, `categoria`

#### `donations`
- Registro de donaciones recibidas
- Columnas: `id`, `nombreDonante`, `correo`, `monto`, `fecha`, `metodoPago`

#### `subscriptions`
- Suscriptores al boletín
- Columnas: `id`, `correo`, `fecha`, `estado`

#### `news`
- Noticias y artículos del blog
- Columnas: `id`, `titulo`, `cuerpo`, `imagenUrl`, `fechaPublicacion`

#### `gallery_albums`
- Álbumes de fotos
- Columnas: `id`, `titulo`, `descripcion`, `eventoId`, `imagenes` (jsonb array), `fecha`

#### `application_forms`
- Formularios de inscripción de nuevos miembros
- Columnas: `id`, `nombre`, `correo`, `datosPersonales`, `datosFamiliares`, `datosVehiculo` (jsonb), `fotoUrl`, `pdfUrl`, `fecha`

## 🔐 Autenticación y Autorización

### Flujo de Autenticación Microsoft Entra ID

1. Usuario hace clic en "Iniciar Sesión con Microsoft"
2. Redirige a OAuth2 de Microsoft
3. Usuario autoriza con cuenta @fundacionlamamedellin.org
4. Backend valida token y verifica dominio
5. Backend genera JWT con roles del usuario
6. Frontend almacena token y actualiza Zustand store
7. Requests subsecuentes incluyen `Authorization: Bearer <token>`

### Roles y Permisos

| Rol                | Permisos                                                      |
|--------------------|---------------------------------------------------------------|
| **Presidente**     | Acceso total al sistema                                       |
| **Vicepresidente** | Gestión de usuarios, eventos, reportes                        |
| **Secretario**     | Gestión de miembros, actas, documentos                        |
| **Tesorero**       | Gestión de donaciones, reportes financieros                   |
| **GerenciaNegocios** | Souvenirs, sponsors, alianzas comerciales                   |
| **MTO**            | Eventos de Moto-Touring, rutas, seguridad vial               |
| **Administrador**  | Panel completo, configuración técnica                         |
| **CommunityManager** | Noticias, galería, redes sociales                           |
| **Miembro**        | Ver eventos, perfil personal, foro (futuro)                   |
| **Invitado**       | Solo lectura de páginas públicas                              |

## 🛠️ API Endpoints

### Autenticación
- `POST /api/auth/login` - Login con Microsoft Entra ID
- `POST /api/auth/validate` - Validar token JWT

### Usuarios y Roles
- `GET /api/users` - Listar usuarios
- `GET /api/users/:email` - Buscar usuario por email
- `POST /api/users` - Crear usuario
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `POST /api/roles/seed` - Poblar roles iniciales

### Miembros
- `GET /api/members` - Listar miembros
- `GET /api/members/:id` - Ver perfil de miembro
- `POST /api/members` - Crear perfil
- `PATCH /api/members/:id` - Actualizar perfil
- `DELETE /api/members/:id` - Eliminar perfil

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `GET /api/vehicles/user/:userId` - Vehículos de un usuario
- `GET /api/vehicles/:id` - Ver vehículo
- `POST /api/vehicles` - Registrar vehículo
- `PATCH /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo
- `POST /api/vehicles/:id/transfer` - Transferir propiedad

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/upcoming` - Próximos eventos
- `GET /api/events/:id` - Ver evento
- `POST /api/events` - Crear evento
- `PATCH /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Cancelar evento

### Souvenirs
- `GET /api/souvenirs` - Listar productos
- `GET /api/souvenirs/category/:category` - Filtrar por categoría
- `GET /api/souvenirs/:id` - Ver producto
- `POST /api/souvenirs` - Crear producto
- `PATCH /api/souvenirs/:id` - Actualizar producto
- `DELETE /api/souvenirs/:id` - Eliminar producto
- `POST /api/souvenirs/:id/inventory` - Actualizar inventario

### Noticias
- `GET /api/news` - Listar noticias
- `GET /api/news/recent?limit=5` - Noticias recientes
- `GET /api/news/:id` - Ver noticia
- `POST /api/news` - Publicar noticia
- `PATCH /api/news/:id` - Editar noticia
- `DELETE /api/news/:id` - Eliminar noticia

### Donaciones
- `GET /api/donations` - Listar donaciones
- `GET /api/donations/total` - Suma total de donaciones
- `GET /api/donations/:id` - Ver donación
- `POST /api/donations` - Registrar donación

### Suscripciones
- `GET /api/subscriptions` - Listar suscriptores
- `POST /api/subscriptions/subscribe` - Suscribirse al boletín
- `POST /api/subscriptions/unsubscribe` - Cancelar suscripción

### Galería
- `GET /api/gallery` - Listar álbumes
- `GET /api/gallery/:id` - Ver álbum
- `POST /api/gallery` - Crear álbum
- `PATCH /api/gallery/:id` - Actualizar álbum
- `DELETE /api/gallery/:id` - Eliminar álbum
- `POST /api/gallery/:id/images` - Agregar foto al álbum

### Formularios de Inscripción
- `GET /api/forms` - Listar formularios (admin)
- `GET /api/forms/:id` - Ver formulario (admin)
- `POST /api/forms` - Enviar formulario (público con upload de foto)

## 📦 Despliegue a Azure

### 1. Crear Recursos Azure

```powershell
cd infrastructure
az deployment group create \
  --resource-group rg-lama-medellin \
  --template-file bicep/main.bicep \
  --parameters location=eastus
```

### 2. Configurar Azure Pipelines

1. Crear Service Connection en Azure DevOps
2. Importar `infrastructure/azure-pipelines.yml`
3. Configurar variable groups:
   - `AZURE_SUBSCRIPTION`
   - `BACKEND_APP_NAME`
   - `FRONTEND_APP_NAME`
   - Variables de entorno (DB_HOST, AZURE_STORAGE_CONNECTION_STRING, etc.)

### 3. Trigger Pipeline

```powershell
git push origin main
```

## 🧪 Testing

### Backend Tests (Jest + Supertest)

```powershell
cd backend
npm test
npm run test:e2e
npm run test:cov
```

### Frontend Tests (Vitest + React Testing Library)

```powershell
cd frontend
npm test
npm run test:ui
```

## 📖 Documentación Adicional

- **Swagger API Docs**: `http://localhost:3000/api/docs`
- **Backend README**: `backend/README.md`
- **Frontend Storybook** (futuro): `npm run storybook`

## 🛡️ Seguridad

- ✅ Variables de entorno con secretos **NO** commiteadas a Git
- ✅ Validación de dominio @fundacionlamamedellin.org en autenticación
- ✅ Encriptación de contraseñas con bcrypt (salt rounds: 10)
- ✅ JWT con expiración de 24 horas
- ✅ CORS limitado al dominio del frontend
- ✅ Validación de inputs con class-validator en todos los DTOs
- ✅ Sanitización de SQL con TypeORM query builders
- 🔄 HTTPS enforced en producción (pendiente)
- 🔄 Rate limiting (pendiente)
- 🔄 Helmet headers (pendiente)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit cambios (`git commit -m 'Agregar NuevaFuncionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abrir Pull Request

### Convenciones de Código

- **Clean Architecture**: Separación de capas (controllers, services, entities, DTOs)
- **TypeScript**: Strict mode habilitado
- **Nomenclatura**: camelCase para variables/funciones, PascalCase para clases
- **Documentación**: Comentarios en español técnico para funciones públicas
- **Commits**: Mensajes descriptivos en español

## 📜 Licencia

Este proyecto es propiedad de la **Fundación L.A.M.A. Medellín**. Todos los derechos reservados.

## 📧 Contacto

- **Gerencia de Negocios**: gerencia@fundacionlamamedellin.org
- **Soporte Técnico**: admin@fundacionlamamedellin.org
- **Sitio Web**: https://www.fundacionlamamedellin.org

---

**Desarrollado con ❤️ para la comunidad motera de Medellín**
