# Infraestructura Simplificada Azure - Ambiente Dev

## 🎯 Objetivo

Esta configuración simplificada elimina complejidades innecesarias para el ambiente de desarrollo:
- ❌ Sin Key Vault
- ❌ Sin Container Apps
- ❌ Sin redes privadas
- ✅ Solo PaaS básico: Web App + PostgreSQL + Storage

## 📦 Recursos Desplegados

| Recurso | Tipo | SKU | Propósito |
|---------|------|-----|-----------|
| `lama-dev-backend` | App Service Web App | B1 (Linux) | Backend NestJS |
| `lama-dev-pg` | PostgreSQL Flexible Server | Standard_B1ms | Base de datos |
| `lamadevstroage` | Storage Account | Standard_LRS | Blobs (uploads) |
| `lama-dev-plan` | App Service Plan | B1 Linux | Hosting |

## 🚀 Despliegue Completo

### 1. Eliminar ambiente anterior (si existe)

```powershell
az group delete --name rg-lama-dev --yes --no-wait
```

### 2. Desplegar infraestructura nueva

```powershell
cd infra
.\Deploy-Simple.ps1
```

Este script:
- ✅ Crea el resource group `rg-lama-dev`
- ✅ Genera secretos automáticamente (PostgreSQL password, JWT secret)
- ✅ Despliega todos los recursos vía Bicep
- ✅ Configura App Settings con todas las variables
- ✅ Guarda credenciales en `infra/.env.dev.json`

**Tiempo estimado**: 5-10 minutos

### 3. Compilar y empaquetar backend

```powershell
# Compilar TypeScript
cd backend
npm run build

# Crear ZIP de despliegue
cd ..
.\infra\scripts\Package-Backend.ps1
```

Esto genera `backend/deploy-backend.zip` con:
- `dist/` (código compilado)
- `node_modules/` (solo producción)
- `package.json`
- `web.config`

### 4. Desplegar backend a Azure

```powershell
# Leer configuración
$config = Get-Content infra/.env.dev.json | ConvertFrom-Json

# Desplegar ZIP
az webapp deployment source config-zip `
    -g $config.resourceGroup `
    -n $config.webAppName `
    --src backend/deploy-backend.zip
```

### 5. Verificar despliegue

```powershell
# Health check
curl https://lama-dev-backend.azurewebsites.net/health

# Ver logs en vivo
az webapp log tail -g rg-lama-dev -n lama-dev-backend
```

## 🔧 Configuración

### Variables de Entorno (App Settings)

Todas se configuran automáticamente en el despliegue:

**Database**
- `DB_HOST`: FQDN del PostgreSQL Server
- `DB_PORT`: 5432
- `DB_USERNAME`: lamadmin
- `DB_PASSWORD`: (generado automáticamente)
- `DB_DATABASE`: lamadb
- `DB_SSL`: true

**JWT**
- `JWT_SECRET`: (generado automáticamente)
- `JWT_EXPIRATION`: 7d

**Azure Storage**
- `AZURE_STORAGE_CONNECTION_STRING`: (generado desde Storage Account)
- `AZURE_STORAGE_CONTAINER_NAME`: uploads

**Features**
- `FEATURE_BLOB_REQUIRED`: false
- `FEATURE_EMAIL_REQUIRED`: false
- `ENABLE_SWAGGER`: 0 (deshabilitar para acelerar cold start)

**Node/Express**
- `NODE_ENV`: production
- `PORT`: 8080
- `WEBSITES_PORT`: 8080
- `FRONTEND_URL`: http://localhost:5173

## 📝 Archivos Generados

### `infra/.env.dev.json`

Contiene todas las credenciales y URLs:

```json
{
  "resourceGroup": "rg-lama-dev",
  "webAppName": "lama-dev-backend",
  "webAppUrl": "https://lama-dev-backend.azurewebsites.net",
  "postgresHost": "lama-dev-pg.postgres.database.azure.com",
  "postgresPassword": "••••••",
  "jwtSecret": "••••••",
  "storageAccountName": "lamadevstroage",
  "deploymentDate": "2025-01-15 10:30:00"
}
```

⚠️ **IMPORTANTE**: Este archivo contiene secretos. NO lo subas a Git.

## 🔄 Comandos Útiles

### Ver logs en tiempo real

```powershell
az webapp log tail -g rg-lama-dev -n lama-dev-backend --provider application
```

### Reiniciar Web App

```powershell
az webapp restart -g rg-lama-dev -n lama-dev-backend
```

### Conectar a PostgreSQL localmente

```powershell
$config = Get-Content infra/.env.dev.json | ConvertFrom-Json
$env:PGPASSWORD = $config.postgresPassword

psql -h $config.postgresHost -U lamadmin -d lamadb
```

### Ver App Settings actuales

```powershell
az webapp config appsettings list -g rg-lama-dev -n lama-dev-backend -o table
```

### Actualizar un App Setting

```powershell
az webapp config appsettings set `
    -g rg-lama-dev `
    -n lama-dev-backend `
    --settings ENABLE_SWAGGER=1
```

## 🐛 Troubleshooting

### Web App no responde

```powershell
# Ver estado
az webapp show -g rg-lama-dev -n lama-dev-backend --query state

# Ver logs de arranque
az webapp log tail -g rg-lama-dev -n lama-dev-backend

# Verificar health endpoint
curl https://lama-dev-backend.azurewebsites.net/health
```

### Cold start lento

- Verificar que `ENABLE_SWAGGER=0` (Swagger añade 3-5s al cold start)
- Considerar upgrade a plan superior (P1v2 tiene mejor CPU)
- Habilitar `Always On` en plan Basic o superior

### Error de conexión a PostgreSQL

```powershell
# Verificar firewall rules
az postgres flexible-server firewall-rule list `
    -g rg-lama-dev `
    -n lama-dev-pg `
    -o table

# Ver detalles del servidor
az postgres flexible-server show `
    -g rg-lama-dev `
    -n lama-dev-pg
```

### Storage Account no conecta

```powershell
# Verificar connection string
az webapp config appsettings list `
    -g rg-lama-dev `
    -n lama-dev-backend `
    --query "[?name=='AZURE_STORAGE_CONNECTION_STRING']"
```

## 🗑️ Limpieza

Para eliminar todos los recursos:

```powershell
az group delete --name rg-lama-dev --yes
```

Esto elimina:
- Web App
- App Service Plan
- PostgreSQL Server (y la base de datos)
- Storage Account (y todos los blobs)

## 📚 Diferencias con setup anterior

| Aspecto | Setup Anterior | Setup Simple |
|---------|---------------|--------------|
| Key Vault | ✅ Usado | ❌ Removido |
| Secretos | En Key Vault | En App Settings directamente |
| Container Apps | ✅ Usado | ❌ Removido |
| Hosting | Container Apps | App Service Web App |
| Networking | Private endpoints | Public (firewall rules) |
| Complejidad | Alta | Baja |
| Tiempo deploy | 15-20 min | 5-10 min |
| Costo mensual | ~$50-80 | ~$25-40 |

## ✅ Ventajas del Setup Simple

1. **Más rápido**: Deploy en 5-10 min vs 15-20 min
2. **Más barato**: Solo recursos esenciales
3. **Más fácil debug**: Logs directos, sin complicaciones
4. **Sin bloqueos**: No hay private endpoints que puedan fallar
5. **Menos moving parts**: Menos cosas que configurar/romper

## ⚠️ Consideraciones de Seguridad

Este setup es para **desarrollo**, NO para producción:

- ✅ HTTPS habilitado
- ✅ PostgreSQL con SSL
- ✅ Storage Account sin acceso público a blobs
- ⚠️ Secretos en App Settings (no en Key Vault)
- ⚠️ PostgreSQL firewall permite todas las IPs (para desarrollo)
- ⚠️ No hay private endpoints

Para **producción**, considerar:
- Key Vault para secretos
- Private endpoints para PostgreSQL
- Firewall rules restrictivos
- Managed Identity en lugar de connection strings
