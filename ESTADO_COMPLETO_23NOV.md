# Estado del Proyecto - Backend y Frontends Funcionales

**Fecha:** 23 de noviembre de 2025  
**Estado General:** Backend funcional sin DB, Frontends configurados, Pendiente activación completa de PostgreSQL

---

## ✅ Completado

### Backend (lama-backend-dev)
- ✅ Servidor Node.js 24 LTS desplegado en Azure App Service
- ✅ Endpoints funcionando en modo sin DB (`DISABLE_DB=1`):
  - `GET /health` → 200 OK `{"status":"ok","service":"lama-backend","uptime":XX}`
  - `GET /api/docs` → 200 OK (Swagger UI)
- ✅ CORS configurado para frontend:
  - `FRONTEND_URL=https://lama-developer-web-nwanseevbtccc.azurewebsites.net`
- ✅ Variables de entorno configuradas:
  - `PORT=8080`
  - `NODE_ENV=production`
  - `DB_HOST=lama-pg-dev.postgres.database.azure.com`
  - `DB_NAME=lama_db`
  - `DB_USER=pgadmin`
  - `DB_PORT=5432`
  - `DB_PASS=@Microsoft.KeyVault(SecretUri=...)` ✅
  - `DB_PASSWORD=@Microsoft.KeyVault(SecretUri=...)` ✅ (ambos configurados por compatibilidad)
  - `WEBSITE_HEALTHCHECK_URL=/health`
- ✅ Código actualizado:
  - `data-source.ts`: Soporta `DB_PASS` y `DB_PASSWORD`, normaliza usuarios
  - `main.ts`: Health endpoint en raíz, retry logic, logs verbosos

### Frontend Vite (frontend/)
- ✅ API URL actualizada a producción en `src/services/api.ts`
- ✅ Archivo `.env.production` creado:
  ```
  VITE_API_URL=https://lama-backend-dev.azurewebsites.net/api
  ```

### Frontend Next.js (frontend-next/)
- ✅ Ya configurado para producción en `lib/config.ts`
- ✅ Archivo `.env.production` creado:
  ```
  NEXT_PUBLIC_API_BASE=https://lama-backend-dev.azurewebsites.net/api
  ```

### Infraestructura (IaC)
- ✅ Plantilla Bicep actualizada (`infra/main-webapp.bicep`):
  - Parámetros: `frontendUrl`, `enableHealthcheck`, `dbPassSecretUri`
  - App settings: `FRONTEND_URL`, `WEBSITE_HEALTHCHECK_URL`, `DB_PASS`
- ✅ Scripts PowerShell creados:
  - `infra/scripts/Configure-WebApp-NoDB.ps1`: Configurar modo diagnóstico
  - `infra/scripts/Run-Migrations-SSH.ps1`: Ejecutar migraciones via SSH
  - `infra/scripts/Get-Live-Logs.ps1`: Obtener logs (existente)

### Tooling
- ✅ Azure CLI reinstalado y funcional
- ✅ Sesión Azure activa: `ms-az-danielvillamizar@outlook.com`

---

## ⚠️ Bloqueador Actual

### Conexión PostgreSQL Falla al Activar DB

**Síntoma:**  
Cuando `DISABLE_DB=0`, la aplicación no arranca (timeout en health endpoint).

**Diagnóstico:**
- Firewall PostgreSQL: ✅ Regla `AllowAllAzureServicesAndResourcesWithinAzureIps` (0.0.0.0) habilitada
- Variables conexión: ✅ Todas configuradas (`DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PORT`)
- Secrets KeyVault: ✅ `DB_PASS` y `DB_PASSWORD` con referencias correctas
- SSL: ✅ Código activa SSL en producción (`data-source.ts` línea ~34)

**Posibles Causas:**
1. **Password incorrecto en KeyVault**: El secreto `DB-PASSWORD` puede no coincidir con el de PostgreSQL
2. **Usuario sin permisos**: `pgadmin` podría no tener acceso a `lama_db`
3. **Migraciones pendientes**: Base vacía/sin esquema, app falla al inicializar TypeORM
4. **Timeout TypeORM**: Conexión tarda más de lo esperado, app reinicia antes de completar
5. **SSL Handshake**: Configuración SSL puede requerir ajustes (cert, modes)

---

## 📋 Próximos Pasos (Orden Recomendado)

### 1. Validar Password PostgreSQL
```powershell
# Opción A: Regenerar password y actualizar KeyVault
az postgres flexible-server update --name lama-pg-dev --resource-group lama-dev-rg --admin-password <NUEVO_PASSWORD>
az keyvault secret set --vault-name lama-kv-dev99 --name DB-PASSWORD --value <NUEVO_PASSWORD>

# Opción B: Ver password actual (si tienes permisos)
az keyvault secret show --vault-name lama-kv-dev99 --name DB-PASSWORD --query value -o tsv
```

### 2. Probar Conexión Manual (desde local o Cloud Shell)
```bash
# Instalar psql client
apt-get update && apt-get install -y postgresql-client

# Conectar (usar password del KeyVault)
psql "host=lama-pg-dev.postgres.database.azure.com port=5432 dbname=lama_db user=pgadmin sslmode=require"

# Verificar esquema
\dt
# Si vacío, necesitas correr migraciones
```

### 3. Ejecutar Migraciones (Si Base Vacía)
```powershell
# Opción A: Via SSH en la WebApp
cd infra/scripts
./Run-Migrations-SSH.ps1 -WebAppName lama-backend-dev -ResourceGroup lama-dev-rg

# Opción B: Localmente (requiere variables de entorno)
cd backend
npm run migration:run
```

### 4. Ajustar Configuración DB (Si Persiste)
Editar `backend/src/data-source.ts`:
```typescript
// Incrementar timeout de conexión
connectTimeoutMS: 30000,
// Ajustar SSL mode
ssl: { rejectUnauthorized: false, ca: null }
// Agregar pool config
extra: {
  max: 10,
  connectionTimeoutMillis: 30000
}
```

### 5. Reactivar DB con Logging Detallado
```powershell
# Activar logging verbose de TypeORM
az webapp config appsettings set --name lama-backend-dev --resource-group lama-dev-rg --settings DISABLE_DB=0 TYPEORM_LOGGING=true
az webapp restart --name lama-backend-dev --resource-group lama-dev-rg

# Monitorear logs en vivo
az webapp log tail --name lama-backend-dev --resource-group lama-dev-rg

# O usar Kudu para logs detallados
# https://lama-backend-dev.scm.azurewebsites.net → Bash → cat /home/LogFiles/*
```

### 6. Smoke Tests Post-Activación
```powershell
# Health
curl https://lama-backend-dev.azurewebsites.net/health

# Swagger
curl https://lama-backend-dev.azurewebsites.net/api/docs

# Endpoints API (requiere usuario creado)
curl -X POST https://lama-backend-dev.azurewebsites.net/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"test123"}'

# Listar usuarios (requiere token)
curl https://lama-backend-dev.azurewebsites.net/api/users -H "Authorization: Bearer <TOKEN>"
```

---

## 🎯 Objetivo Final

**Backend y ambos frontends completamente funcionales:**
- ✅ Backend con DB activa, migraciones aplicadas, endpoints CRUD operativos
- ✅ Frontend Vite compilado y apuntando a backend prod
- ✅ Frontend Next.js compilado y apuntando a backend prod
- ✅ CORS funcionando end-to-end
- ✅ Autenticación JWT operativa (login, refresh, logout)
- ✅ Al menos un smoke test exitoso (crear usuario, login, listar datos)

---

## 📝 Notas Técnicas

### Arquitectura Backend
- **Stack:** Node.js 24 LTS, NestJS, TypeORM, PostgreSQL 16
- **Autenticación:** JWT con refresh tokens, Entra ID (Microsoft multi-tenant)
- **Migraciones:** TypeORM migrations en `backend/src/migrations/`
- **Secrets:** Azure Key Vault references en app settings

### Arquitectura Frontends
- **Vite (frontend/):** React + Vite, axios, localStorage para tokens
- **Next.js (frontend-next/):** App Router, RSC, fetch/axios

### Entidades Principales
- User, Role, MemberProfile, Event, Donation, News, Souvenir, Subscription, Vehicle, ApplicationForm, GalleryAlbum
- Tokens: EmailConfirmationToken, PasswordResetToken, RefreshToken

### Comandos Útiles
```powershell
# Ver todas las app settings
az webapp config appsettings list --name lama-backend-dev --resource-group lama-dev-rg -o table

# SSH a la webapp
az webapp ssh --name lama-backend-dev --resource-group lama-dev-rg

# Ver logs históricos
az webapp log download --name lama-backend-dev --resource-group lama-dev-rg --log-file logs.zip

# Estado del servidor PostgreSQL
az postgres flexible-server show --name lama-pg-dev --resource-group lama-dev-rg -o table
```

---

## 🔧 Troubleshooting Rápido

| Problema | Diagnóstico | Solución |
|----------|-------------|----------|
| `/health` timeout con DISABLE_DB=0 | Error conexión PostgreSQL | Validar password KeyVault, firewall, SSL config |
| `401 Unauthorized` en endpoints | JWT no válido o expirado | Regenerar token via `/api/auth/login` |
| CORS error en frontend | Origin no permitido | Agregar/actualizar `FRONTEND_URL` en backend |
| Migraciones fallan | Base no accesible o permisos | Verificar usuario tiene `CREATE` en DB |
| KeyVault reference no resuelve | Managed Identity sin permisos | Asignar rol "Key Vault Secrets User" a WebApp |

---

**Resumen:** Backend sin DB ✅ funcional, con DB ❌ falla por conexión PostgreSQL. Revisar password/permisos/migraciones para completar activación.
