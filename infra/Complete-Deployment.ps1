# Completa el despliegue creando el Web App y configurándolo
param(
    [string]$ResourceGroup = "rg-lama-dev",
    [string]$WebAppName = "lama-dev-backend",
    [string]$PlanName = "lama-dev-plan",
    [string]$StorageAccount = "lamadevstorage",
    [string]$PostgresServer = "lama-dev-pg",
    [string]$PostgresPassword = "SecurePass123!Z9",
    [string]$JwtSecret = "jwt32charsecretkey1234567890abc"
)

$ErrorActionPreference = "Continue"
Write-Host "=== Completando Despliegue ===" -ForegroundColor Cyan

# 1. Crear Web App
Write-Host "`n1. Creando Web App..." -ForegroundColor Yellow
az webapp create --resource-group $ResourceGroup --plan $PlanName --name $WebAppName --runtime "NODE:20-lts" --https-only true --output none --only-show-errors 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Web App creado" -ForegroundColor Green
} else {
    Write-Host "   Web App ya existe o error" -ForegroundColor Yellow
}

# 2. Obtener connection string de Storage
Write-Host "`n2. Obteniendo credenciales de Storage..." -ForegroundColor Yellow
$storageConnStr = az storage account show-connection-string --name $StorageAccount --resource-group $ResourceGroup --query connectionString --output tsv

# 3. Configurar App Settings
Write-Host "`n3. Configurando App Settings..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $ResourceGroup --name $WebAppName --settings `
    NODE_ENV=production `
    PORT=8080 `
    WEBSITES_PORT=8080 `
    WEBSITE_RUN_FROM_PACKAGE=1 `
    SCM_DO_BUILD_DURING_DEPLOYMENT=false `
    ENABLE_ORYX_BUILD=false `
    DB_HOST="$PostgresServer.postgres.database.azure.com" `
    DB_PORT=5432 `
    DB_USERNAME=lamadmin `
    DB_PASSWORD=$PostgresPassword `
    DB_DATABASE=lamadb `
    DB_SSL=true `
    JWT_SECRET=$JwtSecret `
    JWT_EXPIRATION=7d `
    FRONTEND_URL=http://localhost:5173 `
    AZURE_STORAGE_CONNECTION_STRING="$storageConnStr" `
    AZURE_STORAGE_CONTAINER_NAME=uploads `
    FEATURE_BLOB_REQUIRED=false `
    FEATURE_EMAIL_REQUIRED=false `
    ENABLE_SWAGGER=0 `
    WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10 `
    --output none --only-show-errors 2>&1 | Out-Null

Write-Host "   App Settings configurados" -ForegroundColor Green

# 4. Reiniciar Web App
Write-Host "`n4. Reiniciando Web App..." -ForegroundColor Yellow
az webapp restart --resource-group $ResourceGroup --name $WebAppName --output none 2>&1 | Out-Null
Write-Host "   Web App reiniciado" -ForegroundColor Green

# Resumen
Write-Host "`n=== CONFIGURACION COMPLETADA ===" -ForegroundColor Green
Write-Host "`nWeb App: https://$WebAppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host "Health: https://$WebAppName.azurewebsites.net/health" -ForegroundColor Cyan
Write-Host "`nProximos pasos:" -ForegroundColor Yellow
Write-Host "  1. cd backend && npm run build"
Write-Host "  2. ..\infra\scripts\Package-Backend.ps1"
Write-Host "  3. az webapp deployment source config-zip -g $ResourceGroup -n $WebAppName --src backend/deploy-backend.zip"

