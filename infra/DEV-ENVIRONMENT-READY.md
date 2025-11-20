# 🎉 Ambiente de Desarrollo - LISTO Y OPERATIVO

**Fecha:** 20 de Noviembre 2025  
**Región:** Central US  
**Resource Group:** lama-dev-rg

---

## 📦 Recursos Creados

### 🌐 Web App
- **Nombre:** `lama-backend-dev`
- **URL:** https://lama-backend-dev.azurewebsites.net
- **Runtime:** Node.js 24 LTS ✅
- **Plan:** lama-asp-dev (Linux Basic B1)
- **Identidad:** SystemAssigned (Managed Identity) ✅
- **HTTPS Only:** ✅

### 🗄️ PostgreSQL Flexible Server
- **Nombre:** `lama-pg-dev`
- **Host:** `lama-pg-dev.postgres.database.azure.com`
- **Puerto:** `5432`
- **Versión:** `16`
- **Usuario:** `pgadmin`
- **Password:** *Guardado en Key Vault como `DB-PASSWORD`*
- **Base de Datos:** `lama_db` ✅ CREADA
- **SKU:** Standard_B1ms (Burstable)
- **Storage:** 32 GB
- **Backup:** 7 días
- **Firewall:** Azure Services habilitado

### 🔐 Key Vault
- **Nombre:** `lama-kv-dev99`
- **URI:** https://lama-kv-dev99.vault.azure.net/
- **Tipo:** RBAC (sin access policies legacy)
- **Secretos:**
  - `DB-PASSWORD` ✅
  - `JWT-SECRET` ✅
- **Permisos:**
  - Web App → Key Vault Secrets User ✅
  - Tu usuario → Key Vault Secrets Officer ✅

### 📊 Application Insights
- **Nombre:** `lama-ai-dev`
- **Tipo:** Clásico (no workspace-based)
- **Integrado:** Web App configurada con Instrumentation Key ✅

### 💾 Storage Account
- **Nombre:** `lamastoragedev99`
- **SKU:** Standard_LRS
- **Tipo:** StorageV2
- **TLS:** 1.2 mínimo ✅
- **Blob público:** Deshabilitado ✅

---

## ⚙️ Variables de Entorno Configuradas

Las siguientes App Settings están configuradas en la Web App con referencias seguras a Key Vault:

```bash
PORT=8080
NODE_ENV=production
DB_HOST=lama-pg-dev.postgres.database.azure.com
DB_PORT=5432
DB_USER=pgadmin@lama-pg-dev
DB_NAME=lama_db
KEY_VAULT_NAME=lama-kv-dev99
DB_PASSWORD=@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/DB-PASSWORD)
JWT_SECRET=@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/JWT-SECRET)
APPINSIGHTS_INSTRUMENTATIONKEY=<configurado>
```

---

## 🚀 Despliegue de Código

### Opción 1: GitHub Actions (Recomendado)
El workflow `.github/workflows/deploy-backend.yml` está configurado. Solo necesitas:

1. **Configurar secretos en GitHub:**
   ```
   AZURE_CREDENTIALS (Service Principal JSON)
   POSTGRES_ADMIN_PASSWORD (LAMAdev2025!Secure)
   ```

2. **Push a main:**
   ```bash
   git add .
   git commit -m "Deploy infrastructure ready"
   git push origin main
   ```

### Opción 2: Despliegue Manual con Azure CLI
```bash
cd backend
npm ci
npm run build
az webapp deployment source config-zip \
  --resource-group lama-dev-rg \
  --name lama-backend-dev \
  --src backend.zip
```

### Opción 3: Despliegue desde VS Code
1. Instalar extensión "Azure App Service"
2. Click derecho en `lama-backend-dev` → Deploy to Web App
3. Seleccionar carpeta `backend`

---

## 🗃️ Ejecutar Migraciones de Base de Datos

### Desde Kudu Console (Portal Azure):
1. Ir a: https://lama-backend-dev.scm.azurewebsites.net/
2. Debug Console → CMD
3. Ejecutar:
   ```bash
   cd site/wwwroot
   npm run migrate
   ```

### Usando SSH (Azure CLI):
```bash
az webapp ssh --name lama-backend-dev --resource-group lama-dev-rg
cd /home/site/wwwroot
npm run migrate
```

### Script PowerShell Local (si tienes conectividad):
```powershell
$env:DB_HOST="lama-pg-dev.postgres.database.azure.com"
$env:DB_PORT="5432"
$env:DB_USER="pgadmin@lama-pg-dev"
$env:DB_PASSWORD="LAMAdev2025!Secure"
$env:DB_NAME="lama_db"
cd backend
npm run migrate
```

---

## 🔍 Verificación y Monitoreo

### Health Endpoints
```bash
# Health check básico
curl https://lama-backend-dev.azurewebsites.net/health

# Readiness check (incluye DB)
curl https://lama-backend-dev.azurewebsites.net/health/ready
```

### Ver Logs en Tiempo Real
```bash
az webapp log tail --name lama-backend-dev --resource-group lama-dev-rg
```

### Application Insights
Portal Azure → lama-ai-dev → Logs (KQL)
```kql
traces
| where timestamp > ago(1h)
| order by timestamp desc
```

---

## 🔧 Comandos Útiles

### Reiniciar Web App
```bash
az webapp restart --name lama-backend-dev --resource-group lama-dev-rg
```

### Conectar a PostgreSQL
```bash
psql -h lama-pg-dev.postgres.database.azure.com -U pgadmin -d lama_db
# Password: LAMAdev2025!Secure
```

### Ver App Settings
```bash
az webapp config appsettings list \
  --name lama-backend-dev \
  --resource-group lama-dev-rg
```

### Ver Secretos de Key Vault
```bash
az keyvault secret show \
  --vault-name lama-kv-dev99 \
  --name DB-PASSWORD \
  --query value -o tsv
```

---

## 📋 Checklist Post-Despliegue

- [ ] Código desplegado en Web App
- [ ] Migraciones ejecutadas
- [ ] `/health` retorna 200 OK
- [ ] `/health/ready` retorna 200 OK
- [ ] Logs sin errores en Application Insights
- [ ] Base de datos `lama_db` con tablas creadas
- [ ] Conexión PostgreSQL funcional desde Web App

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
- Verificar firewall de PostgreSQL permite Azure Services
- Confirmar que `DB_PASSWORD` está en Key Vault
- Revisar logs: `az webapp log tail`

### Error: "KeyVault access denied"
- Verificar rol RBAC de Web App: debe tener "Key Vault Secrets User"
- Esperar ~5 minutos para propagación de roles

### Error: "Application not responding"
- Verificar runtime Node 24 LTS configurado
- Reiniciar Web App
- Revisar logs de arranque en Kudu

---

## 📞 Recursos Adicionales

- **Portal Azure:** https://portal.azure.com
- **Kudu (SCM):** https://lama-backend-dev.scm.azurewebsites.net
- **Application Insights:** Portal → lama-ai-dev
- **Documentación PostgreSQL:** https://learn.microsoft.com/azure/postgresql/flexible-server/

---

**✅ Todo está listo para desarrollo. ¡Despliega tu código y comienza a construir!**
