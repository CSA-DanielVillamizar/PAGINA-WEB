# 🗺️ Roadmap de Desarrollo - Fundación LAMA Medellín

## ✅ Fase 1: Infraestructura Base (COMPLETADA)

- [x] PostgreSQL Flexible Server v16 configurado
- [x] 12 tablas base creadas vía migraciones TypeORM
- [x] Azure Blob Storage conectado (lamastoragedev99)
- [x] Azure Communication Services Email configurado
- [x] Key Vault con secretos y Managed Identity
- [x] Endpoints de diagnóstico funcionales
- [x] GitHub Actions CI/CD pipeline activo

---

## 🔄 Fase 2: Configuración de Email (PRIORIDAD ALTA)

### 2.1 Configurar Dominio en Azure Communication Services

**Objetivo**: Habilitar envío real de correos electrónicos

**Pasos**:
1. **Azure Portal** → `lama-comm-dev` (Communication Services)
2. **Email** → **Domains**
3. Elegir una de dos opciones:

#### Opción A: Dominio Azure (Rápido, 5 minutos)
- Click **Add Azure domain**
- Selecciona una región
- Obtendrás algo como: `<tu-subdomain>.azurecomm.net`
- **Ventaja**: Configuración inmediata, sin verificación DNS
- **Desventaja**: Dominio genérico Azure

#### Opción B: Dominio Custom (Recomendado, 24-48 horas)
- Click **Add custom domain**
- Ingresar: `fundacionlamamedellin.org`
- Copiar registros DNS requeridos (TXT, CNAME)
- Agregar registros en tu proveedor DNS
- Esperar verificación (24-48 horas)
- **Ventaja**: Correos desde `@fundacionlamamedellin.org`
- **Desventaja**: Requiere acceso DNS y tiempo de propagación

### 2.2 Actualizar Email Sender

Una vez el dominio esté verificado:

```powershell
# Actualizar secreto en Key Vault
az keyvault secret set `
  --vault-name lama-kv-dev99 `
  --name email-sender `
  --value "no-reply@TU-DOMINIO-VERIFICADO"

# Reiniciar App Service para recargar configuración
az webapp restart -g lama-dev-rg -n lama-backend-dev
```

### 2.3 Test de Envío Real

```powershell
Invoke-RestMethod "https://lama-backend-dev.azurewebsites.net/api/diagnostics/email?to=TU-EMAIL@gmail.com"
```

**Esperado**:
```json
{
  "enabled": true,
  "sentTo": "TU-EMAIL@gmail.com"
}
```

### 2.4 Habilitar Email como Requerido (Opcional)

Una vez validado el envío:

```
FEATURE_EMAIL_REQUIRED = true  # En App Settings
```

---

## 🚀 Fase 3: Desarrollo de Módulos Backend (PRIORIDAD ALTA)

### 3.1 Módulo de Usuarios y Autenticación

**Tareas**:
- [ ] Implementar registro de usuarios con validación de email
- [ ] Endpoint de confirmación de email con token
- [ ] Sistema de recuperación de contraseña
- [ ] Refresh tokens y manejo de sesiones
- [ ] Middleware de roles y permisos

**Endpoints a desarrollar**:
```typescript
POST   /api/auth/register          // Registro con envío de email
POST   /api/auth/confirm-email     // Confirmar email con token
POST   /api/auth/login             // Login con JWT
POST   /api/auth/refresh           // Refresh token
POST   /api/auth/forgot-password   // Solicitar reset
POST   /api/auth/reset-password    // Resetear con token
GET    /api/auth/me                // Perfil usuario actual
```

**Test de envío de email de bienvenida**:
```powershell
# Después de implementar
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "fullName": "Usuario Prueba"
}

# Debe enviar email con link de confirmación
```

### 3.2 Módulo de Miembros

**Tareas**:
- [ ] CRUD completo de perfiles de miembros
- [ ] Upload de foto de perfil a Blob Storage
- [ ] Endpoint de estadísticas de membresía
- [ ] Filtros y búsqueda avanzada

**Endpoints**:
```typescript
GET    /api/members               // Listar miembros (paginado)
GET    /api/members/:id           // Detalle miembro
POST   /api/members               // Crear perfil miembro
PUT    /api/members/:id           // Actualizar perfil
DELETE /api/members/:id           // Eliminar miembro
POST   /api/members/:id/photo     // Upload foto (Blob Storage)
GET    /api/members/stats         // Estadísticas
```

**Test de upload de foto**:
```powershell
# Crear FormData con imagen
$form = @{
    photo = Get-Item "C:\path\to\photo.jpg"
}

Invoke-RestMethod `
  -Uri "https://lama-backend-dev.azurewebsites.net/api/members/123/photo" `
  -Method POST `
  -Form $form `
  -Headers @{Authorization="Bearer $token"}

# Debe retornar URL de Blob Storage
```

### 3.3 Módulo de Vehículos

**Tareas**:
- [ ] CRUD de vehículos con historial de propietarios (JSONB)
- [ ] Upload de fotos del vehículo (múltiples imágenes)
- [ ] Endpoint de transferencia de propiedad
- [ ] Reporte de historial de vehículo

**Endpoints**:
```typescript
GET    /api/vehicles              // Listar vehículos
GET    /api/vehicles/:id          // Detalle vehículo
POST   /api/vehicles              // Registrar vehículo
PUT    /api/vehicles/:id          // Actualizar datos
DELETE /api/vehicles/:id          // Dar de baja
POST   /api/vehicles/:id/photos   // Upload múltiples fotos
POST   /api/vehicles/:id/transfer // Transferir propiedad
GET    /api/vehicles/:id/history  // Historial completo
```

### 3.4 Módulo de Eventos

**Tareas**:
- [ ] CRUD de eventos con imagen de portada
- [ ] Sistema de inscripciones (tabla many-to-many)
- [ ] Envío de recordatorios por email (scheduled jobs)
- [ ] Generación de certificados de asistencia (PDF)

**Endpoints**:
```typescript
GET    /api/events                     // Listar eventos
GET    /api/events/:id                 // Detalle evento
POST   /api/events                     // Crear evento
PUT    /api/events/:id                 // Actualizar evento
DELETE /api/events/:id                 // Cancelar evento
POST   /api/events/:id/cover           // Upload portada
POST   /api/events/:id/register        // Inscribirse
GET    /api/events/:id/attendees       // Lista inscritos
POST   /api/events/:id/send-reminder   // Enviar recordatorio
GET    /api/events/:id/certificate/:userId  // Certificado PDF
```

### 3.5 Módulo de Donaciones

**Tareas**:
- [ ] Endpoint de registro de donación
- [ ] Integración con pasarela de pago (Stripe/PayU/Mercado Pago)
- [ ] Envío automático de recibo por email (PDF)
- [ ] Dashboard de donaciones y métricas

**Endpoints**:
```typescript
POST   /api/donations                  // Crear donación
POST   /api/donations/:id/process      // Procesar pago
GET    /api/donations/:id              // Detalle donación
GET    /api/donations/:id/receipt      // Descargar recibo PDF
GET    /api/donations/stats            // Estadísticas
GET    /api/donations/monthly-report   // Reporte mensual
```

**Flujo típico**:
```typescript
// 1. Crear intención de donación
POST /api/donations
{
  "amount": 50000,
  "donorEmail": "donante@email.com",
  "donorName": "Juan Pérez",
  "message": "Para alimentación"
}

// 2. Procesar pago (retorna URL de pago)
POST /api/donations/123/process
{
  "paymentMethod": "stripe"
}

// 3. Webhook confirma pago → envío automático de email con recibo PDF
```

### 3.6 Módulo de Galería

**Tareas**:
- [ ] CRUD de álbumes con imágenes (JSONB array)
- [ ] Upload masivo de fotos a Blob Storage
- [ ] Generación de thumbnails automáticos
- [ ] Búsqueda por tags y fechas

**Endpoints**:
```typescript
GET    /api/gallery                    // Listar álbumes
GET    /api/gallery/:id                // Detalle álbum
POST   /api/gallery                    // Crear álbum
PUT    /api/gallery/:id                // Actualizar álbum
DELETE /api/gallery/:id                // Eliminar álbum
POST   /api/gallery/:id/photos         // Upload múltiples fotos
DELETE /api/gallery/:id/photos/:photoId  // Eliminar foto
```

---

## 🎨 Fase 4: Frontend (SIGUIENTE PRIORIDAD)

### 4.1 Decisión de Stack Frontend

**Opciones recomendadas**:

#### Opción A: Next.js 14 (App Router)
- ✅ Server Components para SEO
- ✅ API Routes integradas
- ✅ Image optimization automático
- ✅ TypeScript nativo
- 🎯 **Recomendado para sitios públicos con SEO crítico**

#### Opción B: React + Vite
- ✅ Build más rápido
- ✅ HMR instantáneo
- ✅ Bundle más ligero
- ✅ Configuración simple
- 🎯 **Recomendado para apps internas o dashboards**

#### Opción C: Astro + React Islands
- ✅ Cero JavaScript por defecto
- ✅ Performance extremo
- ✅ React solo donde se necesita
- ✅ Ideal para contenido estático
- 🎯 **Recomendado si priorizas máxima performance**

### 4.2 Estructura Frontend Propuesta

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Rutas públicas
│   │   │   ├── page.tsx       # Home
│   │   │   ├── eventos/       # Lista eventos
│   │   │   ├── galeria/       # Galería fotos
│   │   │   └── contacto/      # Formulario
│   │   ├── (auth)/            # Rutas con auth
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── (dashboard)/       # Panel admin
│   │       ├── miembros/
│   │       ├── vehiculos/
│   │       ├── donaciones/
│   │       └── reportes/
│   ├── components/
│   │   ├── ui/                # Shadcn/UI components
│   │   ├── forms/             # Formularios reutilizables
│   │   └── layouts/           # Layouts
│   ├── lib/
│   │   ├── api-client.ts      # Axios/Fetch wrapper
│   │   └── auth.ts            # JWT handling
│   └── types/
│       └── api.ts             # TypeScript types del backend
├── public/
└── package.json
```

### 4.3 Páginas Principales a Desarrollar

**Públicas** (sin autenticación):
- [ ] Landing page con misión/visión
- [ ] Galería de eventos pasados
- [ ] Formulario de contacto (envía email)
- [ ] Página de donaciones con integración de pago
- [ ] Blog/Noticias

**Protegidas** (requieren login):
- [ ] Dashboard administrativo
- [ ] Gestión de miembros
- [ ] Registro de vehículos
- [ ] Creación y gestión de eventos
- [ ] Reportes y estadísticas

---

## 📊 Fase 5: Monitoreo y Observabilidad

### 5.1 Application Insights

**Tareas**:
- [ ] Configurar custom metrics para endpoints críticos
- [ ] Dashboards para:
  - Tiempos de respuesta por endpoint
  - Errores 5xx y 4xx
  - Uso de Blob Storage (uploads/downloads)
  - Envíos de email (exitosos/fallidos)
- [ ] Alertas automáticas:
  - Tasa de error > 5%
  - Latencia P95 > 2 segundos
  - Fallos consecutivos en Blob/Email

### 5.2 Logging Estructurado

**Implementar**:
```typescript
// backend/src/common/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }
}
```

### 5.3 Health Checks Avanzados

**Extender `/api/health`**:
```typescript
// Agregar checks para:
- PostgreSQL connection
- Blob Storage accessibility
- Email Service availability
- Memoria y CPU usage
- Disk space

// Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2025-11-21T03:00:00Z",
  "checks": {
    "database": { "status": "up", "responseTime": "45ms" },
    "blobStorage": { "status": "up", "containerExists": true },
    "emailService": { "status": "up", "quotaRemaining": 9500 },
    "memory": { "used": "256MB", "total": "512MB", "percentage": 50 },
    "cpu": { "usage": "12%" }
  }
}
```

---

## 🔒 Fase 6: Seguridad y Hardening

### 6.1 Seguridad de API

**Tareas**:
- [ ] Implementar rate limiting (express-rate-limit)
- [ ] Helmet.js para headers de seguridad
- [ ] CORS configurado correctamente
- [ ] Validación exhaustiva con class-validator
- [ ] Sanitización de inputs (XSS prevention)
- [ ] SQL injection prevention (TypeORM ya lo hace, pero validar)

### 6.2 Rotación de Secretos

**Plan**:
```bash
# Cada 90 días rotar:
1. JWT_SECRET
2. DB_PASSWORD
3. AZURE_STORAGE_KEY
4. AZURE_COMMUNICATION_CONNECTION_STRING

# Usar Azure Key Vault Secret Versioning automático
```

### 6.3 Auditoría y Compliance

**Implementar**:
- [ ] Tabla `audit_logs` para registrar acciones críticas
- [ ] Middleware de auditoría para endpoints sensibles
- [ ] Exportación de logs para compliance (GDPR, etc.)

---

## 🚀 Fase 7: Performance y Escalabilidad

### 7.1 Caching

**Implementar**:
```typescript
// Redis o In-Memory cache para:
- Lista de eventos públicos (TTL: 5 minutos)
- Estadísticas de dashboard (TTL: 1 hora)
- Configuración de la app (TTL: 1 día)
```

### 7.2 CDN para Blob Storage

**Configurar Azure CDN**:
- Servir imágenes desde CDN en lugar de Blob directo
- Ahorro de costos y mejora de latencia
- Compresión automática de imágenes

### 7.3 Database Indexing

**Revisar y optimizar**:
```sql
-- Índices sugeridos (crear vía migración):
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_members_status ON member_profiles(membership_status);
```

---

## 📦 Fase 8: DevOps y Deployment

### 8.1 Ambientes

**Configurar**:
- ✅ `dev` (lama-backend-dev) - **ACTUAL**
- [ ] `staging` (lama-backend-staging) - Para QA
- [ ] `production` (lama-backend-prod) - Producción real

### 8.2 Estrategia de Deployment

**Blue-Green Deployment**:
```yaml
# GitHub Actions con slots de Azure App Service
1. Deploy a slot 'staging'
2. Run smoke tests
3. Swap staging → production si tests pasan
4. Rollback automático si falla
```

### 8.3 Backup y Disaster Recovery

**Plan**:
- [ ] Backup automático de PostgreSQL (ya habilitado 7 días)
- [ ] Geo-replication de Blob Storage
- [ ] Export semanal de datos críticos a Azure Storage Archive
- [ ] Documentar procedimiento de recuperación

---

## 📱 Fase 9: Features Avanzadas (FUTURO)

### 9.1 Notificaciones Push

- [ ] Firebase Cloud Messaging para app móvil
- [ ] Web Push Notifications para navegadores
- [ ] Notificar eventos próximos, donaciones recibidas

### 9.2 Integración con Redes Sociales

- [ ] Login con Google/Facebook OAuth
- [ ] Compartir eventos en redes sociales
- [ ] Feed de Instagram en el sitio web

### 9.3 Reportes Automáticos

- [ ] Cron job mensual: reporte de donaciones (PDF por email)
- [ ] Cron job trimestral: reporte de actividades
- [ ] Dashboard ejecutivo con Power BI / Metabase

### 9.4 App Móvil

- [ ] React Native o Flutter
- [ ] Funcionalidades:
  - Ver eventos y registrarse
  - Escanear QR de membresía
  - Donar desde el móvil
  - Galería de fotos

---

## 🎯 Resumen de Prioridades

### ⚡ **INMEDIATO** (Esta semana)
1. ✅ ~~Configurar infraestructura base~~ (COMPLETADO)
2. 🔄 Configurar dominio de email en ACS
3. 🔄 Implementar módulo de Autenticación completo

### 📅 **CORTO PLAZO** (2-4 semanas)
4. Desarrollar módulos backend (Miembros, Vehículos, Eventos)
5. Iniciar desarrollo frontend (elegir stack)
6. Implementar módulo de Donaciones con pasarela

### 📆 **MEDIANO PLAZO** (1-3 meses)
7. Completar frontend público y admin
8. Configurar monitoreo avanzado
9. Hardening de seguridad
10. Performance optimization

### 🔮 **LARGO PLAZO** (3+ meses)
11. Features avanzadas (push, social, reportes)
12. App móvil
13. Multi-tenant para otras fundaciones

---

## 📞 Contacto y Ayuda

- **GitHub Issues**: Para bugs y features
- **Documentación**: Ver `README.md` y `CONFIGURACION_MANUAL.md`
- **Logs**: Azure Portal → App Service → Log Stream

---

**Última actualización**: 2025-11-21  
**Estado del sistema**: ✅ Producción - Funcional  
**Cobertura de tests**: 0% (pendiente implementar)
