# ✅ Recursos Azure Creados - LAMA Foundation

## 📊 Resumen del Despliegue

**Resource Group**: `lama-foundation-rg`  
**Región**: Central US  
**Fecha**: 19 de noviembre de 2025

---

## 🎯 Recursos Exitosamente Creados

### 1. Storage Accounts (2)
- ✅ **lamadevw7kb4d** (Central US)
- ✅ **lamastoragecus** (Central US)
- SKU: Standard_LRS
- TLS: 1.2 mínimo
- Blob público: Deshabilitado

### 2. PostgreSQL Flexible Server
- ✅ **lama-pg-dev** (Central US)
- **FQDN**: `lama-pg-dev.postgres.database.azure.com`
- **Usuario**: `pgadmin`
- **Password**: `LAMAadmin2024!`
- **Versión**: PostgreSQL 16
- **SKU**: Standard_B1ms (Burstable)
- **Storage**: 32 GB
- **Backup**: 7 días
- **Base de datos**: `lama_db` ✅ CREADA

### 3. Key Vault
- ✅ **lama-kv-cus2025** (Central US)
- **URI**: `https://lama-kv-cus2025.vault.azure.net/`
- **RBAC**: Habilitado
- **Soft Delete**: Habilitado
- **Purge Protection**: Habilitado

---

## 📝 Configuración Completada

### Backend .env Actualizado

El archivo `backend/.env` ya está configurado con:

```env
DB_HOST=lama-pg-dev.postgres.database.azure.com
DB_PORT=5432
DB_USER=pgadmin
DB_PASS=LAMAadmin2024!
DB_NAME=lama_db
```

---

## ⚠️ Pendiente de Configuración

### 1. Firewall de PostgreSQL
El firewall no pudo configurarse completamente. Necesitas:

**Opción A - Azure Portal**:
1. Ir a https://portal.azure.com
2. Buscar `lama-pg-dev`
3. **Networking** → **Firewall rules**
4. Añadir regla:
   - Name: `AllowAllAzureIps`
   - Start IP: `0.0.0.0`
   - End IP: `0.0.0.0`
   - **Save**

**Opción B - Azure CLI**:
```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1
az postgres flexible-server firewall-rule create `
  --resource-group lama-foundation-rg `
  --name lama-pg-dev `
  --rule-name AllowAllAzureIps `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0
```

### 2. App Registration en Entra ID

**IMPORTANTE**: Todavía necesitas crear esto manualmente.

**Pasos**:
1. Ir a **Azure Portal** → **Microsoft Entra ID**
2. **App registrations** → **+ New registration**
3. Configuración:
   - **Name**: `LAMA Medellin Web App`
   - **Supported account types**: ✅ **Multitenant** (Any Microsoft Entra ID tenant)
   - **Redirect URI**: 
     - Platform: Web
     - URI: `http://localhost:5173/auth/callback`
4. Después de crear:
   - Copiar **Application (client) ID** → Actualizar `ENTRA_CLIENT_ID` en `.env`
   - Copiar **Directory (tenant) ID** → Ya está en `.env`: `95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae`
5. **Certificates & secrets** → **+ New client secret**:
   - Description: `Backend API Secret`
   - Expires: 24 months
   - **⚠️ COPIAR EL VALUE INMEDIATAMENTE** → Actualizar `ENTRA_CLIENT_SECRET` en `.env`

### 3. Almacenar Secrets en Key Vault

Una vez tengas el App Registration:

```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1

# Client ID
az keyvault secret set `
  --vault-name lama-kv-cus2025 `
  --name ENTRA-CLIENT-ID `
  --value "<TU_CLIENT_ID>"

# Client Secret
az keyvault secret set `
  --vault-name lama-kv-cus2025 `
  --name ENTRA-CLIENT-SECRET `
  --value "<TU_CLIENT_SECRET>"

# JWT Secret (genera una cadena aleatoria de 64 caracteres)
az keyvault secret set `
  --vault-name lama-kv-cus2025 `
  --name JWT-SECRET `
  --value "$((-join ((65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})))"

# DB Password
az keyvault secret set `
  --vault-name lama-kv-cus2025 `
  --name DB-PASSWORD `
  --value "LAMAadmin2024!"
```

### 4. Asignar Permisos RBAC en Key Vault

```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1

# Obtener tu Object ID
$objectId = az ad signed-in-user show --query id -o tsv

# Asignar rol Key Vault Secrets User
az role assignment create `
  --role "Key Vault Secrets User" `
  --assignee $objectId `
  --scope "/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/lama-foundation-rg/providers/Microsoft.KeyVault/vaults/lama-kv-cus2025"
```

---

## 🚀 Próximos Pasos

### 1. Probar Conexión a PostgreSQL

```powershell
# Instalar psql si no lo tienes
# winget install PostgreSQL.PostgreSQL

$env:PGPASSWORD="LAMAadmin2024!"
psql -h lama-pg-dev.postgres.database.azure.com -U pgadmin -d lama_db

# En psql:
# \l       # Listar bases de datos
# \dt      # Listar tablas (vacío por ahora)
# \q       # Salir
```

### 2. Ejecutar Migraciones TypeORM

```powershell
cd c:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation\backend

# Verificar que .env esté correcto
npm run typeorm:run

# O ejecutar el backend que auto-sincroniza
npm run start:dev
```

### 3. Verificar que el Backend Inicie

```powershell
cd backend
npm run start:dev
```

Deberías ver:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] INFO [RoutesResolver] Mapped {/api/auth/login-url, GET}
...
[Nest] INFO [NestApplication] Nest application successfully started
```

Abrir: http://localhost:3000/api/docs (Swagger UI)

### 4. Seedear Roles Iniciales

```bash
# Crear roles por defecto
curl -X POST http://localhost:3000/api/roles/seed
```

---

## 📊 Comandos Útiles

### Verificar Recursos
```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1

# Listar todos los recursos
az resource list -g lama-foundation-rg -o table

# Ver detalles de PostgreSQL
az postgres flexible-server show -g lama-foundation-rg -n lama-pg-dev -o table

# Ver detalles de Key Vault
az keyvault show -n lama-kv-cus2025 -o table

# Listar secrets en Key Vault
az keyvault secret list --vault-name lama-kv-cus2025 -o table
```

### Logs de PostgreSQL
```powershell
# Ver logs del servidor
az postgres flexible-server server-logs list -g lama-foundation-rg -n lama-pg-dev

# Descargar un log específico
az postgres flexible-server server-logs download `
  -g lama-foundation-rg `
  -n lama-pg-dev `
  --name <log-file-name>
```

---

## 🎉 Resumen de Lo Logrado

✅ Resource Group creado en Central US  
✅ 2 Storage Accounts desplegados  
✅ PostgreSQL Flexible Server 16 funcionando  
✅ Base de datos `lama_db` creada  
✅ Key Vault con RBAC habilitado  
✅ Backend `.env` actualizado con credenciales de Azure  
✅ Documentación completa:
  - MSAL_MULTI_TENANT_GUIDE.md
  - DEPLOYMENT_GUIDE.md
  - AZURE_PORTAL_SETUP.md
  - SSL_TROUBLESHOOTING.md
  - PROJECT_STATUS.md

---

## 📚 Documentación de Referencia

- **Configuración Multi-Tenant**: `MSAL_MULTI_TENANT_GUIDE.md`
- **Guía de Despliegue**: `DEPLOYMENT_GUIDE.md`
- **Setup Manual Portal**: `AZURE_PORTAL_SETUP.md`
- **Problemas SSL**: `SSL_TROUBLESHOOTING.md`
- **Estado del Proyecto**: `PROJECT_STATUS.md`

---

## 🆘 Soporte

Si tienes problemas:

1. **Firewall PostgreSQL**: Verificar en Portal que la regla 0.0.0.0 esté creada
2. **Conexión DB**: Verificar que el firewall permita tu IP
3. **App Registration**: Asegurarte de copiar el Client Secret inmediatamente (no se puede ver después)
4. **Key Vault**: Verificar que tienes el rol "Key Vault Secrets User"
5. **SSL Issues**: Ver `SSL_TROUBLESHOOTING.md`

---

**Fecha de creación**: 19 de noviembre de 2025  
**Región**: Central US  
**Estado**: ✅ LISTO PARA DESARROLLO

