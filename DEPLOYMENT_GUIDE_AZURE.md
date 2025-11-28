# Guía de Despliegue a Producción (Azure)

Esta guía documenta el proceso completo para desplegar la aplicación L.A.M.A. Medellín (frontend + backend) a Azure con configuración SMTP y base de datos PostgreSQL.

## Arquitectura de Producción

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Azure Static   │      │  Azure App       │      │  Azure Database │
│  Web Apps       │─────▶│  Service         │─────▶│  for PostgreSQL │
│  (Frontend)     │      │  (Backend API)   │      │  Flexible Server│
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                │                           
                                │                           
                         ┌──────▼───────┐                  
                         │  Azure Key   │                  
                         │  Vault       │                  
                         │  (Secretos)  │                  
                         └──────────────┘                  
```

## Requisitos Previos

- Azure CLI instalado: `az --version`
- Sesión activa: `az login`
- Permisos de Contributor en la suscripción
- Node.js 20.x localmente para builds

## Parte 1: Despliegue de Infraestructura Base

### 1.1. Crear Resource Group

```powershell
$resourceGroup = "lama-foundation-rg"
$location = "eastus"

az group create `
  --name $resourceGroup `
  --location $location
```

### 1.2. Crear PostgreSQL Flexible Server

```powershell
$dbServerName = "lama-pg-prod"
$dbAdminUser = "pgadmin"
$dbAdminPass = "<GeneraContraseñaSegura>"  # Usa un generador seguro
$dbName = "lama_db"

az postgres flexible-server create `
  --resource-group $resourceGroup `
  --name $dbServerName `
  --location $location `
  --admin-user $dbAdminUser `
  --admin-password $dbAdminPass `
  --sku-name Standard_B2s `
  --tier Burstable `
  --version 16 `
  --storage-size 32 `
  --public-access 0.0.0.0-255.255.255.255

# Crear base de datos
az postgres flexible-server db create `
  --resource-group $resourceGroup `
  --server-name $dbServerName `
  --database-name $dbName
```

**Notas:**
- `--public-access 0.0.0.0-255.255.255.255`: permite conexiones desde Azure y tu IP local. En producción usa VNet.
- Anota el FQDN: `lama-pg-prod.postgres.database.azure.com`

### 1.3. Crear Key Vault para Secretos

```powershell
$keyVaultName = "lama-kv-prod"  # Debe ser único globalmente

az keyvault create `
  --name $keyVaultName `
  --resource-group $resourceGroup `
  --location $location `
  --sku standard

# Almacenar secretos
az keyvault secret set --vault-name $keyVaultName --name db-password --value $dbAdminPass
az keyvault secret set --vault-name $keyVaultName --name smtp-pass --value "FLM902007705-8*"
az keyvault secret set --vault-name $keyVaultName --name jwt-secret --value "<GeneraJWTSecret>"
```

### 1.4. Crear App Service (Backend)

```powershell
$appServicePlan = "lama-plan-prod"
$appServiceName = "lama-backend-prod"  # Debe ser único globalmente

# Plan Linux con Node 20
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --location $location `
  --is-linux `
  --sku B1

# Web App
az webapp create `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --name $appServiceName `
  --runtime "NODE:20-lts"

# Habilitar identidad administrada (para Key Vault)
az webapp identity assign `
  --resource-group $resourceGroup `
  --name $appServiceName

# Obtener el principalId
$principalId = az webapp identity show `
  --resource-group $resourceGroup `
  --name $appServiceName `
  --query principalId `
  --output tsv

# Dar permisos al Key Vault
az keyvault set-policy `
  --name $keyVaultName `
  --object-id $principalId `
  --secret-permissions get list
```

### 1.5. Crear Static Web App (Frontend)

```powershell
$swaName = "lama-frontend-prod"

az staticwebapp create `
  --name $swaName `
  --resource-group $resourceGroup `
  --location $location `
  --sku Free `
  --source https://github.com/CSA-DanielVillamizar/PAGINA-WEB `
  --branch main `
  --app-location "/frontend" `
  --output-location "dist"
```

**Nota:** Esto generará un GitHub Action automático. Necesitarás configurar el token de despliegue en GitHub Secrets.

## Parte 2: Configurar Backend (App Service)

### 2.1. Obtener URIs de Key Vault

```powershell
$dbPassUri = az keyvault secret show --vault-name $keyVaultName --name db-password --query id -o tsv
$smtpPassUri = az keyvault secret show --vault-name $keyVaultName --name smtp-pass --query id -o tsv
$jwtSecretUri = az keyvault secret show --vault-name $keyVaultName --name jwt-secret --query id -o tsv
```

### 2.2. Configurar App Settings

```powershell
az webapp config appsettings set `
  -g $resourceGroup `
  -n $appServiceName `
  --settings `
    DB_HOST="$dbServerName.postgres.database.azure.com" `
    DB_PORT=5432 `
    DB_USER=$dbAdminUser `
    DB_PASS="@Microsoft.KeyVault(SecretUri=$dbPassUri)" `
    DB_NAME=$dbName `
    DB_SSL=1 `
    SMTP_HOST="smtp.office365.com" `
    SMTP_PORT=587 `
    SMTP_SECURE=false `
    SMTP_USER="gerencia@fundacionlamamedellin.org" `
    SMTP_PASS="@Microsoft.KeyVault(SecretUri=$smtpPassUri)" `
    SMTP_FROM="gerencia@fundacionlamamedellin.org" `
    INSCRIPTIONS_RECEIVER="gerencia@fundacionlamamedellin.org" `
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=$jwtSecretUri)" `
    JWT_EXPIRES_IN="24h" `
    FRONTEND_URL="https://$swaName.azurestaticapps.net" `
    PORT=8080 `
    NODE_ENV=production `
    ENABLE_SWAGGER=0 `
    DISABLE_DB=0 `
    FEATURE_EMAIL_REQUIRED=false `
    WEBSITE_NODE_DEFAULT_VERSION="~20" `
    SCM_DO_BUILD_DURING_DEPLOYMENT=true `
    WEBSITE_STARTUP_FILE="node dist/main.js"
```

### 2.3. Configurar Deployment (GitHub Actions)

**Opción A - Local Git (manual):**
```powershell
# Desde la raíz del repo
cd backend
git init
git add .
git commit -m "Backend deployment"

# Configurar remote de Azure
az webapp deployment source config-local-git `
  --name $appServiceName `
  --resource-group $resourceGroup

# Obtener credenciales
$creds = az webapp deployment list-publishing-credentials `
  --name $appServiceName `
  --resource-group $resourceGroup `
  --query "{username:publishingUserName, password:publishingPassword}" `
  --output json | ConvertFrom-Json

# Push
git remote add azure https://$($creds.username):$($creds.password)@$appServiceName.scm.azurewebsites.net/$appServiceName.git
git push azure main
```

**Opción B - GitHub Actions (recomendado):**

1. Descargar Publish Profile:
   ```powershell
   az webapp deployment list-publishing-profiles `
     --name $appServiceName `
     --resource-group $resourceGroup `
     --xml > backend-publish-profile.xml
   ```

2. Agregar a GitHub Secrets:
   - Repositorio → Settings → Secrets → New repository secret
   - Nombre: `AZURE_BACKEND_PUBLISH_PROFILE`
   - Valor: contenido completo del XML

3. Crear workflow `.github/workflows/backend-deploy.yml`:
   ```yaml
   name: Deploy Backend to Azure
   
   on:
     push:
       branches: [main]
       paths:
         - 'backend/**'
     workflow_dispatch:
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '20'
             cache: 'npm'
             cache-dependency-path: backend/package-lock.json
         
         - name: Install dependencies
           working-directory: backend
           run: npm ci
         
         - name: Build
           working-directory: backend
           run: npm run build
         
         - name: Remove dev dependencies
           working-directory: backend
           run: rm -rf node_modules
         
         - name: Deploy to Azure
           uses: azure/webapps-deploy@v2
           with:
             app-name: lama-backend-prod
             publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
             package: backend
   ```

### 2.4. Ejecutar Migraciones

Una vez desplegado:

```powershell
# SSH al contenedor
az webapp ssh -g $resourceGroup -n $appServiceName

# Dentro del contenedor
cd /home/site/wwwroot
npm run migration:run
exit
```

### 2.5. Verificar Despliegue

```powershell
# Health check
curl https://$appServiceName.azurewebsites.net/health

# Diagnóstico email
curl "https://$appServiceName.azurewebsites.net/api/diagnostics/email?to=tucorreo@ejemplo.com"

# Ver logs en tiempo real
az webapp log tail -g $resourceGroup -n $appServiceName
```

## Parte 3: Configurar Frontend (Static Web App)

### 3.1. Obtener Token de Despliegue

```powershell
$swaToken = az staticwebapp secrets list `
  --name $swaName `
  --resource-group $resourceGroup `
  --query "properties.apiKey" `
  --output tsv
```

### 3.2. Configurar GitHub Secret

- Repositorio → Settings → Secrets → New
- Nombre: `AZURE_SWA_DEPLOYMENT_TOKEN`
- Valor: `$swaToken`

### 3.3. Crear Workflow Frontend

`.github/workflows/frontend-deploy.yml`:

```yaml
name: Deploy Frontend to Azure SWA

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install and Build
        working-directory: frontend
        run: |
          npm ci
          npm run build
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_SWA_DEPLOYMENT_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/frontend'
          output_location: 'dist'
```

### 3.4. Configurar Variables de Entorno (Frontend)

En Azure Portal → Static Web App → Configuration:

```
VITE_API_URL=https://lama-backend-prod.azurewebsites.net/api
```

Actualiza `frontend/vite.config.ts` si es necesario para build de producción.

### 3.5. Verificar Despliegue

Abre la URL de tu Static Web App:
```
https://lama-frontend-prod.azurestaticapps.net
```

Prueba el formulario de inscripción en `/inscripcion`.

## Parte 4: Monitoreo y Mantenimiento

### 4.1. Application Insights (Opcional)

```powershell
$appInsightsName = "lama-insights-prod"

az monitor app-insights component create `
  --app $appInsightsName `
  --location $location `
  --resource-group $resourceGroup `
  --application-type web

$instrumentationKey = az monitor app-insights component show `
  --app $appInsightsName `
  --resource-group $resourceGroup `
  --query instrumentationKey `
  --output tsv

# Agregar a App Settings del backend
az webapp config appsettings set `
  -g $resourceGroup `
  -n $appServiceName `
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=$instrumentationKey"
```

### 4.2. Alertas y Logs

```powershell
# Ver logs en vivo
az webapp log tail -g $resourceGroup -n $appServiceName

# Descargar logs históricos
az webapp log download -g $resourceGroup -n $appServiceName
```

### 4.3. Backups de Base de Datos

```powershell
# Backup manual
az postgres flexible-server backup create `
  --resource-group $resourceGroup `
  --name $dbServerName `
  --backup-name manual-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')

# Configurar retención automática (7-35 días)
az postgres flexible-server update `
  --resource-group $resourceGroup `
  --name $dbServerName `
  --backup-retention 14
```

## Parte 5: Seguridad en Producción

### 5.1. Firewall de PostgreSQL

```powershell
# Limitar acceso solo desde App Service (obtener IPs salientes)
$outboundIps = az webapp show `
  --resource-group $resourceGroup `
  --name $appServiceName `
  --query outboundIpAddresses `
  --output tsv

# Agregar reglas de firewall
$outboundIps -split ',' | ForEach-Object {
  az postgres flexible-server firewall-rule create `
    --resource-group $resourceGroup `
    --name $dbServerName `
    --rule-name "AppService-$($_ -replace '\.','-')" `
    --start-ip-address $_ `
    --end-ip-address $_
}
```

### 5.2. HTTPS y Custom Domain

```powershell
# Agregar dominio personalizado al App Service
az webapp config hostname add `
  --resource-group $resourceGroup `
  --webapp-name $appServiceName `
  --hostname api.fundacionlamamedellin.org

# SSL automático (Let's Encrypt)
az webapp config ssl bind `
  --resource-group $resourceGroup `
  --name $appServiceName `
  --certificate-thumbprint auto `
  --ssl-type SNI
```

### 5.3. Rotación de Secretos

Programa la rotación de:
- Contraseña PostgreSQL (cada 90 días)
- Contraseña SMTP (si cambias buzón)
- JWT_SECRET (si hay compromiso de seguridad)

```powershell
# Actualizar secreto en Key Vault
az keyvault secret set `
  --vault-name $keyVaultName `
  --name smtp-pass `
  --value "<NuevaContraseña>"

# Reiniciar App Service para que tome cambios
az webapp restart -g $resourceGroup -n $appServiceName
```

## Parte 6: Troubleshooting

### Backend no responde

```powershell
# Ver logs de arranque
az webapp log tail -g $resourceGroup -n $appServiceName

# Verificar App Settings
az webapp config appsettings list -g $resourceGroup -n $appServiceName

# Reiniciar
az webapp restart -g $resourceGroup -n $appServiceName

# SSH para debug
az webapp ssh -g $resourceGroup -n $appServiceName
```

### Email no se envía

```powershell
# Verificar diagnóstico
curl "https://$appServiceName.azurewebsites.net/api/diagnostics/email?to=test@ejemplo.com"

# Revisar configuración SMTP
az webapp config appsettings list -g $resourceGroup -n $appServiceName --query "[?name=='SMTP_HOST' || name=='SMTP_USER']"
```

### Frontend no conecta al backend

- Verifica CORS en backend (`FRONTEND_URL`)
- Confirma que `VITE_API_URL` apunta al backend correcto
- Revisa Network tab en DevTools del navegador

## Resumen de Costos Estimados (por mes)

| Recurso                     | SKU/Tier    | Costo Aprox |
|-----------------------------|-------------|-------------|
| App Service Plan (B1)       | Basic       | ~$13 USD    |
| PostgreSQL Flexible (B2s)   | Burstable   | ~$30 USD    |
| Static Web App              | Free        | $0          |
| Key Vault                   | Standard    | ~$1 USD     |
| Application Insights (opt)  | Uso         | ~$5 USD     |
| **Total Estimado**          |             | **~$50 USD**|

**Optimizaciones:**
- Usa slots de staging para pruebas
- Escala automática solo si hay tráfico alto
- Revisa métricas cada mes y ajusta SKUs

## Scripts de Utilidad

Todos los scripts PowerShell están en `backend/`:
- `Setup-Email-Local.ps1`: Desarrollo local
- `Setup-Email-Azure.ps1`: Configuración producción
- `Test-Email-SMTP.ps1`: Prueba de email

## Soporte y Contacto

- Documentación NestJS: https://docs.nestjs.com
- Azure App Service: https://learn.microsoft.com/azure/app-service
- PostgreSQL en Azure: https://learn.microsoft.com/azure/postgresql
