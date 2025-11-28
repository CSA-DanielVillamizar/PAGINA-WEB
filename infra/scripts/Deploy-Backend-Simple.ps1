# Deploy-And-Diagnose-Backend.ps1
# Script simplificado para desplegar backend con diagnóstico

param(
    [string]$PublishSettingsPath = "C:\Users\DanielVillamizar\Downloads\lama-backend-dev.PublishSettings",
    [bool]$EnableDB = $false,
    [string]$DBHost = "lama-pg-dev.privatelink.postgres.database.azure.com",
    [string]$DBName = "postgres",
    [string]$DBPassword = ""
)

$ErrorActionPreference = "Stop"
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = 1

Write-Host "=== Deploy Backend LAMA ===" -ForegroundColor Cyan

# Paso 1: Compilar backend
Write-Host "[1/6] Compilando backend..." -ForegroundColor Yellow
Push-Location "$PSScriptRoot\..\..\backend"
try {
    npm run build | Out-Null
    Write-Host "  OK - Compilado" -ForegroundColor Green
} finally {
    Pop-Location
}

# Paso 2: Crear ZIP
Write-Host "[2/6] Creando ZIP..." -ForegroundColor Yellow
$backendPath = "$PSScriptRoot\..\..\backend"
$zipPath = "$PSScriptRoot\..\..\deploy-backend-diag.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Push-Location $backendPath
try {
    $files = "dist", "node_modules", "package.json", "package-lock.json", "start-with-logging.sh", "db-diagnose.js"
    & tar.exe -a -cf $zipPath $files
    $sizeKB = [Math]::Round((Get-Item $zipPath).Length / 1KB)
    Write-Host "  OK - ZIP creado: $sizeKB KB" -ForegroundColor Green
} finally {
    Pop-Location
}

# Paso 3: Cargar credenciales
Write-Host "[3/6] Cargando credenciales..." -ForegroundColor Yellow
$pp = [xml](Get-Content $PublishSettingsPath)
$prof = $pp.publishData.publishProfile | Where-Object { $_.publishMethod -in 'ZipDeploy','MSDeploy' } | Select-Object -First 1
$pair = "$($prof.userName):$($prof.userPWD)"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{ Authorization = "Basic $basic"; 'If-Match' = '*' }
$kuduHost = ($prof.publishUrl -replace ':443','')
Write-Host "  OK - Kudu: $kuduHost" -ForegroundColor Green

# Paso 4: Desplegar
Write-Host "[4/6] Desplegando..." -ForegroundColor Yellow
$zipApiUrl = "https://$kuduHost/api/zip/site/wwwroot"
try {
    Invoke-RestMethod -Uri $zipApiUrl -Method PUT -Headers $headers -InFile $zipPath -ContentType "application/zip" -TimeoutSec 600 | Out-Null
    Write-Host "  OK - Desplegado" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $_" -ForegroundColor Red
    throw
}

# Paso 5: Configurar settings
Write-Host "[5/6] Configurando app settings..." -ForegroundColor Yellow
$settings = @{
    "DISABLE_DB" = if ($EnableDB) { "0" } else { "1" }
    "DB_HOST" = $DBHost
    "DB_PORT" = "5432"
    "DB_USER" = "pgadmin"
    "DB_NAME" = $DBName
    "DB_SSL" = "1"
    "NODE_ENV" = "production"
}

if ($DBPassword) {
    $settings["DB_PASS"] = $DBPassword
}

$settingsStr = ($settings.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join " "

try {
    az webapp config appsettings set --name lama-backend-dev --resource-group lama-dev-rg --settings $settingsStr --output none 2>&1 | Out-Null
    Write-Host "  OK - Settings configurados (DISABLE_DB=$($settings['DISABLE_DB']))" -ForegroundColor Green
} catch {
    Write-Host "  WARN: $_" -ForegroundColor Yellow
}

# Paso 6: Reiniciar
Write-Host "[6/6] Reiniciando..." -ForegroundColor Yellow
az webapp restart --name lama-backend-dev --resource-group lama-dev-rg --output none 2>&1 | Out-Null
Write-Host "  OK - Reiniciado" -ForegroundColor Green

Write-Host "`nEsperando 30s para startup..." -ForegroundColor Gray
Start-Sleep -Seconds 30

# Leer logs
Write-Host "`n=== LOGS DE DIAGNOSTICO ===" -ForegroundColor Cyan
$logUrl = "https://$kuduHost/api/vfs/home/LogFiles/app-startup.log"
try {
    $logContent = Invoke-RestMethod -Uri $logUrl -Headers $headers -TimeoutSec 30
    $logContent -split "`n" | ForEach-Object { Write-Host $_ }
} catch {
    Write-Host "No se pudo leer app-startup.log: $_" -ForegroundColor Yellow
}

# Verificar health
Write-Host "`n=== HEALTH CHECK ===" -ForegroundColor Cyan
try {
    $resp = Invoke-WebRequest -Uri "https://lama-backend-dev.azurewebsites.net/health" -TimeoutSec 15 -UseBasicParsing
    Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
    Write-Host "Body: $($resp.Content)" -ForegroundColor Green
} catch {
    Write-Host "Health check fallo: $_" -ForegroundColor Red
}

Write-Host "`n=== COMPLETADO ===" -ForegroundColor Cyan
