# Quick Start - Email & Deployment

## Desarrollo Local (5 minutos)

### Backend con SMTP

```powershell
cd backend
.\Setup-Email-Local.ps1 -SmtpPass "FLM902007705-8"
npm run start:dev
```

Backend: http://localhost:8080

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### Probar Email

```bash
curl http://localhost:8080/api/diagnostics/email?to=danielvillamizara@gmail.com
```

O usar el script:
```powershell
cd backend
.\Test-Email-SMTP.ps1 -To "danielvillamizara@gmail.com" -SmtpPass "FLM902007705-8"
```

## Despliegue a Azure (30 minutos)

### 1. Crear Recursos

```powershell
# Variables
$rg = "lama-foundation-rg"
$location = "centralus"
$db = "lama-pg-prod"
$kv = "lama-kv-prod"
$backend = "lama-backend-prod"
$frontend = "lama-frontend-prod"

# Resource Group
az group create --name $rg --location $location

# PostgreSQL
az postgres flexible-server create `
  --resource-group $rg `
  --name $db `
  --admin-user pgadmin `
  --admin-password "LAMAdev2025!Secure" `
  --sku-name Standard_B2s `
  --version 16

# Key Vault
az keyvault create --name $kv --resource-group $rg --location $location
az keyvault secret set --vault-name $kv --name smtp-pass --value "FLM902007705-8"
az keyvault secret set --vault-name $kv --name db-password --value "LAMAdev2025!Secure"

# App Service
az appservice plan create --name lama-plan --resource-group $rg --is-linux --sku B1
az webapp create --resource-group $rg --plan lama-plan --name $backend --runtime "NODE:20-lts"

# Static Web App
az staticwebapp create --name $frontend --resource-group $rg --location $location
```

### 2. Configurar Backend

```powershell
cd backend
.\Setup-Email-Azure.ps1 `
  -ResourceGroup $rg `
  -AppServiceName $backend `
  -SmtpPass "FLM902007705-8" `
  -KeyVaultName $kv
```

### 3. Desplegar

**GitHub Actions (recomendado):**
- Descargar Publish Profile del portal
- Agregar a GitHub Secrets como `AZURE_BACKEND_PUBLISH_PROFILE`
- Push a main → deploy automático

**Manual:**
```powershell
cd backend
git remote add azure <url-from-portal>
git push azure main
```

### 4. Verificar

```bash
curl https://$backend.azurewebsites.net/health
curl "https://$backend.azurewebsites.net/api/diagnostics/email?to=danielvillamizara@gmail.com"
```

## Archivos Clave

### Backend
- `.env.example` - Template de configuración
- `Setup-Email-Local.ps1` - Config desarrollo
- `Setup-Email-Azure.ps1` - Config producción
- `Test-Email-SMTP.ps1` - Prueba email
- `README.md` - Documentación completa

### Guides
- `DEPLOYMENT_GUIDE_AZURE.md` - Guía paso a paso completa
- Este archivo - Quick reference

## Credenciales SMTP (Producción)

```
Host: smtp.office365.com
Port: 587
Security: STARTTLS
User: gerencia@fundacionlamamedellin.org
Pass: FLM902007705-8 (almacenar en Key Vault)
From: gerencia@fundacionlamamedellin.org
```

## Variables de Entorno Críticas

### Local (.env)
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=gerencia@fundacionlamamedellin.org
SMTP_PASS=FLM902007705-8
SMTP_FROM=gerencia@fundacionlamamedellin.org
INSCRIPTIONS_RECEIVER=gerencia@fundacionlamamedellin.org
PORT=8080
FRONTEND_URL=http://localhost:5173
```

### Azure App Settings
```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=gerencia@fundacionlamamedellin.org
SMTP_PASS=@Microsoft.KeyVault(SecretUri=https://lama-kv-prod.vault.azure.net/secrets/smtp-pass)
DB_HOST=lama-pg-prod.postgres.database.azure.com
DB_PASS=@Microsoft.KeyVault(SecretUri=https://lama-kv-prod.vault.azure.net/secrets/db-password)
FRONTEND_URL=https://lama-frontend-prod.azurestaticapps.net
NODE_ENV=production
```

## Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Health check básico |
| `/api/health` | GET | Health check con metadatos |
| `/api/diagnostics/email?to=...` | GET | Prueba envío email |
| `/api/inscriptions/send-email` | POST | Envío formulario con PDF |

## Troubleshooting Rápido

### Email no se envía
- Verificar credenciales SMTP en App Settings
- Revisar que MFA no bloquee (usar App Password)
- Ver logs: `az webapp log tail -g $rg -n $backend`

### Backend no arranca
- Verificar `WEBSITE_STARTUP_FILE=node dist/main.js`
- Confirmar `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- SSH: `az webapp ssh -g $rg -n $backend`

### Frontend no conecta
- Verificar CORS (`FRONTEND_URL` en backend)
- Confirmar `VITE_API_URL` en Static Web App config
- Network tab en DevTools

## Costos Estimados

- App Service B1: ~$13/mes
- PostgreSQL B2s: ~$30/mes
- Static Web App: Free
- Key Vault: ~$1/mes
- **Total: ~$44/mes**

## Siguientes Pasos

1. ✅ Configurar SMTP local → hecho
2. ✅ Crear scripts de setup → hecho
3. ✅ Documentar deployment → hecho
4. ⏳ Desplegar a Azure → pendiente
5. ⏳ Configurar dominio custom
6. ⏳ Setup CI/CD completo
7. ⏳ Monitoreo y alertas

## Referencias

- Documentación completa: `DEPLOYMENT_GUIDE_AZURE.md`
- Backend README: `backend/README.md`
- Scripts: `backend/*.ps1`
