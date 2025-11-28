# Intenta configurar usando REST API directamente
# Alternativa cuando az CLI tiene problemas SSL

param(
    [string]$ResourceGroup = "rg-lama-dev",
    [string]$WebAppName = "lama-dev-backend",
    [string]$SubscriptionId = "f301f085-0a60-44df-969a-045b4375d4e7"
)

Write-Host "=== Configuración via REST API ===" -ForegroundColor Cyan

# Obtener access token
Write-Host "`n1. Obteniendo access token..." -ForegroundColor Yellow
try {
    $tokenResponse = az account get-access-token --query "accessToken" --output tsv 2>&1
    if ($tokenResponse -like "*ERROR*") {
        throw "No se pudo obtener token"
    }
    $token = $tokenResponse
    Write-Host "   ✓ Token obtenido" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
    Write-Host "`nUsando método manual..." -ForegroundColor Yellow
    .\Setup-Manual.ps1
    exit
}

# Preparar headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# URL del Web App
$webAppUrl = "https://management.azure.com/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$WebAppName"
$apiVersion = "2022-03-01"

# Obtener storage key
Write-Host "`n2. Obteniendo Storage Key..." -ForegroundColor Yellow
$storageUrl = "https://management.azure.com/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/lamadevstorage/listKeys?api-version=2023-01-01"

try {
    $storageResponse = Invoke-RestMethod -Uri $storageUrl -Method POST -Headers $headers
    $storageKey = $storageResponse.keys[0].value
    $storageConnStr = "DefaultEndpointsProtocol=https;AccountName=lamadevstorage;AccountKey=$storageKey;EndpointSuffix=core.windows.net"
    Write-Host "   ✓ Storage key obtenida" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nUsando método manual..." -ForegroundColor Yellow
    .\Setup-Manual.ps1
    exit
}

# Configurar App Settings
Write-Host "`n3. Configurando App Settings..." -ForegroundColor Yellow

$appSettings = @{
    properties = @{
        siteConfig = @{
            appSettings = @(
                @{ name = "NODE_ENV"; value = "production" }
                @{ name = "PORT"; value = "8080" }
                @{ name = "WEBSITES_PORT"; value = "8080" }
                @{ name = "WEBSITE_RUN_FROM_PACKAGE"; value = "1" }
                @{ name = "SCM_DO_BUILD_DURING_DEPLOYMENT"; value = "false" }
                @{ name = "ENABLE_ORYX_BUILD"; value = "false" }
                @{ name = "DB_HOST"; value = "lama-dev-pg.postgres.database.azure.com" }
                @{ name = "DB_PORT"; value = "5432" }
                @{ name = "DB_USERNAME"; value = "lamadmin" }
                @{ name = "DB_PASSWORD"; value = "SecurePass123!Z9" }
                @{ name = "DB_DATABASE"; value = "lamadb" }
                @{ name = "DB_SSL"; value = "true" }
                @{ name = "JWT_SECRET"; value = "jwt32charsecretkey1234567890abc" }
                @{ name = "JWT_EXPIRATION"; value = "7d" }
                @{ name = "FRONTEND_URL"; value = "http://localhost:5173" }
                @{ name = "AZURE_STORAGE_CONNECTION_STRING"; value = $storageConnStr }
                @{ name = "AZURE_STORAGE_CONTAINER_NAME"; value = "uploads" }
                @{ name = "FEATURE_BLOB_REQUIRED"; value = "false" }
                @{ name = "FEATURE_EMAIL_REQUIRED"; value = "false" }
                @{ name = "ENABLE_SWAGGER"; value = "0" }
                @{ name = "WEBSITE_HEALTHCHECK_MAXPINGFAILURES"; value = "10" }
            )
        }
    }
}

$body = $appSettings | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$webAppUrl/config/appsettings?api-version=$apiVersion" -Method PUT -Headers $headers -Body $body
    Write-Host "   ✓ App Settings configurados" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nUsando método manual..." -ForegroundColor Yellow
    .\Setup-Manual.ps1
    exit
}

# Reiniciar Web App
Write-Host "`n4. Reiniciando Web App..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$webAppUrl/restart?api-version=$apiVersion" -Method POST -Headers $headers | Out-Null
    Write-Host "   ✓ Web App reiniciado" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ No se pudo reiniciar (puede que no sea necesario)" -ForegroundColor Yellow
}

# Resumen
Write-Host "`n=== CONFIGURACIÓN COMPLETADA ===" -ForegroundColor Green
Write-Host "`nWeb App configurado con todas las variables" -ForegroundColor Cyan
Write-Host "URL: https://$WebAppName.azurewebsites.net" -ForegroundColor White
Write-Host "Health: https://$WebAppName.azurewebsites.net/health" -ForegroundColor White

Write-Host "`nProximos pasos:" -ForegroundColor Yellow
Write-Host "1. Desplegar backend ZIP:" -ForegroundColor White
Write-Host "   Portal - $WebAppName - Deployment Center - Zip Deploy" -ForegroundColor Gray
Write-Host "   Subir: backend\deploy-backend.zip" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Verificar health endpoint:" -ForegroundColor White
Write-Host "   curl https://${WebAppName}.azurewebsites.net/health" -ForegroundColor Gray
