# Configurar Web App usando comandos directos de PowerShell
# Evita problemas SSL del Azure CLI usando métodos alternativos

param(
    [string]$ResourceGroup = "rg-lama-dev",
    [string]$WebAppName = "lama-dev-backend"
)

Write-Host "=== Configurando Web App desde Azure Portal ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Debido a problemas SSL con Azure CLI, configura manualmente:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Ve a: https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$WebAppName/configuration" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. En 'Application settings', agrega estas variables:" -ForegroundColor Yellow
Write-Host ""

$settings = @"
NODE_ENV=production
PORT=8080
WEBSITES_PORT=8080
WEBSITE_RUN_FROM_PACKAGE=1
SCM_DO_BUILD_DURING_DEPLOYMENT=false
ENABLE_ORYX_BUILD=false

DB_HOST=lama-dev-pg.postgres.database.azure.com
DB_PORT=5432
DB_USERNAME=lamadmin
DB_PASSWORD=SecurePass123!Z9
DB_DATABASE=lamadb
DB_SSL=true

JWT_SECRET=jwt32charsecretkey1234567890abc
JWT_EXPIRATION=7d

FRONTEND_URL=http://localhost:5173

FEATURE_BLOB_REQUIRED=false
FEATURE_EMAIL_REQUIRED=false
ENABLE_SWAGGER=0
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10
"@

Write-Host $settings -ForegroundColor White
Write-Host ""

Write-Host "3. Para AZURE_STORAGE_CONNECTION_STRING:" -ForegroundColor Yellow
Write-Host "   a. Ve a: https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/lamadevstorage/keys" -ForegroundColor Cyan
Write-Host "   b. Copia 'Connection string' de key1" -ForegroundColor White
Write-Host "   c. Agrégala como: AZURE_STORAGE_CONNECTION_STRING" -ForegroundColor White
Write-Host ""

Write-Host "4. Agrega también:" -ForegroundColor Yellow
Write-Host "   AZURE_STORAGE_CONTAINER_NAME=uploads" -ForegroundColor White
Write-Host ""

Write-Host "5. Click 'Save' arriba" -ForegroundColor Green
Write-Host ""

Write-Host "=== Desplegar Backend ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Después de configurar los settings:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Compilar backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run build" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Empaquetar:" -ForegroundColor White
Write-Host "   cd .." -ForegroundColor Gray
Write-Host "   .\infra\scripts\Package-Backend.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Desplegar desde Portal:" -ForegroundColor White
Write-Host "   a. Ve a: https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$WebAppName/vstscd" -ForegroundColor Cyan
Write-Host "   b. Click 'Zip Deploy'" -ForegroundColor Gray
Write-Host "   c. Sube: backend\deploy-backend.zip" -ForegroundColor Gray
Write-Host ""

Write-Host "=== URLs Importantes ===" -ForegroundColor Cyan
Write-Host "Web App: https://$WebAppName.azurewebsites.net" -ForegroundColor White
Write-Host "Health: https://$WebAppName.azurewebsites.net/health" -ForegroundColor White
Write-Host "Logs: https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$WebAppName/logStream" -ForegroundColor White
Write-Host ""

# Intentar abrir el portal automáticamente
Write-Host "Presiona ENTER para abrir Azure Portal automáticamente..." -ForegroundColor Yellow
$null = Read-Host
Start-Process "https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$WebAppName/configuration"
