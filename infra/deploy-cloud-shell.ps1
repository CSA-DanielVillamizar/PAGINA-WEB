# Desplegar recursos faltantes desde Cloud Shell (PowerShell)
# Usa esto en https://shell.azure.com (seleccionar PowerShell)

$RG = "rg-lama-dev"
$LOCATION = "centralus"
$PG_PASS = "SecurePass123!Z9"
$JWT_SECRET = "jwt32charsecretkey1234567890abc"

Write-Host "=== Desplegando recursos faltantes en $RG ===" -ForegroundColor Cyan

# 1. PostgreSQL Flexible Server
Write-Host "`n1. Creando PostgreSQL Flexible Server..." -ForegroundColor Yellow
az postgres flexible-server create `
  --name lama-dev-pg `
  --resource-group $RG `
  --location $LOCATION `
  --admin-user lamadmin `
  --admin-password "$PG_PASS" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --version 15 `
  --storage-size 32 `
  --backup-retention 7 `
  --public-access 0.0.0.0-255.255.255.255 `
  --yes

# Crear database
Write-Host "   Creando base de datos lamadb..." -ForegroundColor Gray
az postgres flexible-server db create `
  --resource-group $RG `
  --server-name lama-dev-pg `
  --database-name lamadb

Write-Host "   OK PostgreSQL listo" -ForegroundColor Green

# 2. Storage Account
Write-Host "`n2. Creando Storage Account..." -ForegroundColor Yellow
az storage account create `
  --name lamadevstorage `
  --resource-group $RG `
  --location $LOCATION `
  --sku Standard_LRS `
  --kind StorageV2 `
  --access-tier Hot `
  --allow-blob-public-access false `
  --https-only true

Write-Host "   OK Storage Account listo" -ForegroundColor Green

# 3. Obtener Storage Connection String
Write-Host "`n3. Obteniendo Storage Connection String..." -ForegroundColor Yellow
$STORAGE_CONN = az storage account show-connection-string `
  --name lamadevstorage `
  --resource-group $RG `
  --query connectionString `
  --output tsv

Write-Host "   OK Connection string obtenida" -ForegroundColor Green

# 4. Configurar App Settings del Web App
Write-Host "`n4. Configurando App Settings en lama-dev-backend..." -ForegroundColor Yellow
az webapp config appsettings set `
  --resource-group $RG `
  --name lama-dev-backend `
  --settings `
    NODE_ENV=production `
    PORT=8080 `
    WEBSITES_PORT=8080 `
    WEBSITE_RUN_FROM_PACKAGE=1 `
    SCM_DO_BUILD_DURING_DEPLOYMENT=false `
    ENABLE_ORYX_BUILD=false `
    DB_HOST=lama-dev-pg.postgres.database.azure.com `
    DB_PORT=5432 `
    DB_USERNAME=lamadmin `
    DB_PASSWORD="$PG_PASS" `
    DB_DATABASE=lamadb `
    DB_SSL=true `
    JWT_SECRET="$JWT_SECRET" `
    JWT_EXPIRATION=7d `
    FRONTEND_URL=http://localhost:5173 `
    FEATURE_BLOB_REQUIRED=false `
    FEATURE_EMAIL_REQUIRED=false `
    ENABLE_SWAGGER=0 `
    WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10 `
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONN" `
    AZURE_STORAGE_CONTAINER_NAME=uploads

Write-Host "   OK App Settings configurados" -ForegroundColor Green

# 5. Health check path
Write-Host "`n5. Configurando health check..." -ForegroundColor Yellow
az resource update `
  --resource-group $RG `
  --name lama-dev-backend `
  --resource-type Microsoft.Web/sites `
  --set properties.siteConfig.healthCheckPath="/health"

Write-Host "   OK Health check configurado" -ForegroundColor Green

# Resumen
Write-Host "`n=== INFRAESTRUCTURA COMPLETA ===" -ForegroundColor Green
Write-Host ""
Write-Host "Recursos desplegados:" -ForegroundColor Cyan
az resource list --resource-group $RG --query "[].{Name:name, Type:type}" --output table

Write-Host "`nProximos pasos:" -ForegroundColor Yellow
Write-Host "1. Subir deploy-backend.zip:"
Write-Host "   - Usar 'Upload' en Cloud Shell para subir el archivo"
Write-Host "   - Ejecutar: az webapp deployment source config-zip -g $RG -n lama-dev-backend --src deploy-backend.zip"
Write-Host ""
Write-Host "2. Verificar:"
Write-Host "   Invoke-WebRequest https://lama-dev-backend.azurewebsites.net/health"
