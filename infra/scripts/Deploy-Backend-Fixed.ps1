param(
    [string]$PublishSettingsPath = "C:\Users\DanielVillamizar\Downloads\lama-backend-dev.PublishSettings",
    [bool]$EnableDB = $false,
    [string]$DBPassword = ""
)

$ErrorActionPreference = "Stop"
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = 1

Write-Host "=== Deploy Backend LAMA ===" -ForegroundColor Cyan

# Validar archivo publish settings
if (-not (Test-Path $PublishSettingsPath)) {
    throw "Archivo PublishSettings no encontrado: $PublishSettingsPath"
}

# Paso 1: Empaquetar backend
Write-Host "`n[1/5] Empaquetando backend..." -ForegroundColor Yellow
$backendPath = "$PSScriptRoot\..\..\backend"
$zipPath = "$PSScriptRoot\..\..\deploy-backend-fixed.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Push-Location $backendPath
try {
    $files = @("dist", "node_modules", "package.json", "package-lock.json", "start-with-logging.sh", "db-diagnose.js")
    $tarArgs = @("-a", "-cf", $zipPath) + $files
    & tar.exe $tarArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "tar.exe fallo"
    }
    
    $zipSize = [Math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host "  OK ZIP creado: $zipSize megabytes" -ForegroundColor Green
} finally {
    Pop-Location
}

# Paso 2: Cargar credenciales Kudu
Write-Host "`n[2/5] Cargando credenciales..." -ForegroundColor Yellow
$pp = [xml](Get-Content $PublishSettingsPath)
$prof = $pp.publishData.publishProfile | Where-Object { $_.publishMethod -in 'ZipDeploy','MSDeploy' } | Select-Object -First 1

$pair = "$($prof.userName):$($prof.userPWD)"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{ 
    Authorization = "Basic $basic"
    'If-Match' = '*'
}
$kuduHost = ($prof.publishUrl -replace ':443','')
Write-Host "  OK Kudu: $kuduHost" -ForegroundColor Green

# Paso 3: Desplegar
Write-Host "`n[3/5] Desplegando..." -ForegroundColor Yellow
$zipApiUrl = "https://$kuduHost/api/zip/site/wwwroot"

try {
    Invoke-RestMethod -Uri $zipApiUrl -Method PUT -Headers $headers `
        -InFile $zipPath -ContentType "application/zip" -TimeoutSec 600 | Out-Null
    Write-Host "  OK Deployment completado" -ForegroundColor Green
} catch {
    Write-Host "  ERROR en deployment" -ForegroundColor Red
    throw
}

# Paso 4: Configurar app settings
Write-Host "`n[4/5] Configurando app settings..." -ForegroundColor Yellow

$disableVal = if ($EnableDB) { "0" } else { "1" }
$settingsArgs = "DISABLE_DB=$disableVal DB_HOST=lama-pg-dev.privatelink.postgres.database.azure.com DB_PORT=5432 DB_USER=pgadmin DB_NAME=postgres DB_SSL=1 NODE_ENV=production"

if ($DBPassword) {
    $settingsArgs += " DB_PASS=$DBPassword"
    Write-Host "  DB_PASS actualizado" -ForegroundColor Gray
}

az webapp config appsettings set `
    --name lama-backend-dev `
    --resource-group lama-dev-rg `
    --settings $settingsArgs `
    --output none 2>&1 | Out-Null

Write-Host "  OK Settings configurados (DISABLE_DB=$disableVal)" -ForegroundColor Green

# Paso 5: Reiniciar
Write-Host "`n[5/5] Reiniciando..." -ForegroundColor Yellow
az webapp restart --name lama-backend-dev --resource-group lama-dev-rg --output none 2>&1 | Out-Null
Write-Host "  OK Reinicio iniciado, esperando 30s..." -ForegroundColor Green
Start-Sleep -Seconds 30

# Verificar health
Write-Host "`n--- Health Check ---" -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "https://lama-backend-dev.azurewebsites.net/health" `
        -TimeoutSec 20 -UseBasicParsing
    Write-Host "  OK Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  Body: $($healthResponse.Content)" -ForegroundColor White
} catch {
    Write-Host "  ERROR Health check fallo: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Completado ===" -ForegroundColor Cyan
