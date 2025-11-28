# Estado del Despliegue Simplificado - Azure Dev

## ✅ Completado

### 1. Resource Group Eliminado
- ✅ `rg-lama-dev` anterior eliminado con todos sus recursos

### 2. Infraestructura Desplegada
Los siguientes recursos fueron creados exitosamente:

| Recurso | Nombre | Tipo | Estado |
|---------|--------|------|---------|
| PostgreSQL | `lama-dev-pg` | Flexible Server | ✅ Succeed |
| Storage | `lamadevstorage` | Storage Account | ✅ Succeeded |
| App Plan | `lama-dev-plan` | App Service Plan (B1 Linux) | ✅ Succeeded |
| Web App | `lama-dev-backend` | Web App Node 20 | ✅ Succeeded |
| Identity | `lama-dev-identity` | Managed Identity | ✅ Succeeded |

### 3. Archivos Creados

- ✅ `infra/main-dev-simple.bicep` - Template Bicep simplificado
- ✅ `infra/Deploy-Simple.ps1` - Script de despliegue automatizado
- ✅ `infra/Complete-Deployment.ps1` - Script de configuración post-despliegue
- ✅ `infra/scripts/Package-Backend.ps1` - Script de empaquetado
- ✅ `infra/README-SIMPLE.md` - Documentación completa

## ⚠️ Pendiente (Bloqueado por problema SSL)

### 4. Configurar App Settings del Web App

El Azure CLI tiene un problema de certificados SSL que impide ejecutar comandos:

```
ERROR: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed
```

**Solución temporal**: Configurar manualmente desde Azure Portal

### Variables de App Settings Requeridas

```bash
# Node/Express
NODE_ENV=production
PORT=8080
WEBSITES_PORT=8080
WEBSITE_RUN_FROM_PACKAGE=1
SCM_DO_BUILD_DURING_DEPLOYMENT=false
ENABLE_ORYX_BUILD=false

# Database
DB_HOST=lama-dev-pg.postgres.database.azure.com
DB_PORT=5432
DB_USERNAME=lamadmin
DB_PASSWORD=SecurePass123!Z9
DB_DATABASE=lamadb
DB_SSL=true

# JWT
JWT_SECRET=jwt32charsecretkey1234567890abc
JWT_EXPIRATION=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=(obtener del portal)
AZURE_STORAGE_CONTAINER_NAME=uploads

# Features
FEATURE_BLOB_REQUIRED=false
FEATURE_EMAIL_REQUIRED=false
ENABLE_SWAGGER=0

# Health Check
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10
```

### 5. Desplegar Backend

Pasos pendientes:

```powershell
# 1. Compilar backend
cd backend
npm run build

# 2. Empaquetar
cd ..
.\infra\scripts\Package-Backend.ps1

# 3. Desplegar ZIP (requiere Azure CLI funcional)
az webapp deployment source config-zip `
    -g rg-lama-dev `
    -n lama-dev-backend `
    --src backend/deploy-backend.zip
```

## 🔧 Cómo Resolver el Problema SSL

### Opción 1: Configurar desde Azure Portal (RECOMENDADO)

1. Ir a https://portal.azure.com
2. Buscar "lama-dev-backend"
3. Ir a **Configuration** → **Application settings**
4. Agregar todas las variables listadas arriba
5. Click **Save**
6. Ir a **Deployment Center** → **ZIP Deploy**
7. Subir `backend/deploy-backend.zip` (después de compilar)

### Opción 2: Arreglar Azure CLI

```powershell
# Reinstalar Azure CLI
winget uninstall "Azure CLI"
winget install "Azure CLI"

# O actualizar certificados
az bicep upgrade
az upgrade
```

### Opción 3: Usar Cloud Shell

1. Ir a https://shell.azure.com
2. Subir los archivos necesarios
3. Ejecutar comandos desde Cloud Shell (no tiene problema SSL)

## 📊 Verificación Post-Despliegue

Una vez configurados los App Settings y desplegado el backend:

```powershell
# Health check
curl https://lama-dev-backend.azurewebsites.net/health

# Ver logs en vivo
az webapp log tail -g rg-lama-dev -n lama-dev-backend

# Verificar estado
az webapp show -g rg-lama-dev -n lama-dev-backend --query state
```

## 🎯 Arquitectura Simplificada

```
┌─────────────────────────────────────────┐
│        Azure Resource Group             │
│         (rg-lama-dev)                   │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Web App    │    │  PostgreSQL  │  │
│  │  (Node 20)   │───▶│   (v15)      │  │
│  │   Port 8080  │    │  lamadb      │  │
│  └──────────────┘    └──────────────┘  │
│         │                               │
│         ▼                               │
│  ┌──────────────┐                       │
│  │   Storage    │                       │
│  │   (blobs)    │                       │
│  └──────────────┘                       │
└─────────────────────────────────────────┘
```

## ⚡ Próximos Pasos

1. **MANUAL**: Configurar App Settings desde Azure Portal
2. **LOCAL**: Compilar backend (`npm run build`)
3. **LOCAL**: Empaquetar backend (`Package-Backend.ps1`)
4. **PORTAL**: Subir ZIP desde Deployment Center
5. **VERIFICAR**: Health endpoint `/health`

## 📞 Ayuda

Si continúan los problemas SSL:
- Verificar que no haya proxy corporativo
- Verificar antivirus/firewall
- Usar Cloud Shell como alternativa
- Configurar todo desde Portal Azure (no requiere CLI)
