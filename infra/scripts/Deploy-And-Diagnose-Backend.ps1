<#
.SYNOPSIS
    Despliega backend con diagnóstico integrado y lee logs de conexión PostgreSQL.

.DESCRIPTION
    Este script:
    1. Empaqueta el backend con los archivos de diagnóstico actualizados
    2. Despliega vía Kudu Zip API
    3. Configura app settings para prueba con DB habilitada
    4. Reinicia el App Service
    5. Espera y lee los logs de diagnóstico (/home/LogFiles/app-startup.log)
    6. Muestra secciones relevantes: [DB-DIAG-PRE], Paso 8, errores

.PARAMETER PublishSettingsPath
    Ruta al archivo .PublishSettings del backend.
    Default: C:\Users\DanielVillamizar\Downloads\lama-backend-dev.PublishSettings

.PARAMETER EnableDB
    Si es $true, habilita la conexión a DB (DISABLE_DB=0).
    Default: $false (mantiene DB deshabilitada para prueba segura)

.PARAMETER DBHost
    Host de PostgreSQL. Default: lama-pg-dev.privatelink.postgres.database.azure.com

.PARAMETER DBName
    Nombre de base de datos. Default: postgres (para diagnóstico)

.PARAMETER DBPassword
    Contraseña de PostgreSQL (texto plano temporal). Si no se proporciona, no se actualiza.

.EXAMPLE
    .\Deploy-And-Diagnose-Backend.ps1 -EnableDB $true -DBPassword "MiPasswordSeguro"
#>

param(
    [string]$PublishSettingsPath = "C:\Users\DanielVillamizar\Downloads\lama-backend-dev.PublishSettings",
    [bool]$EnableDB = $false,
    [string]$DBHost = "lama-pg-dev.privatelink.postgres.database.azure.com",
    [string]$DBName = "postgres",
    [string]$DBPassword = ""
)

$ErrorActionPreference = "Stop"
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = 1

Write-Host "=== Deploy y Diagnóstico Backend LAMA ===" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# Validar archivo publish settings
if (-not (Test-Path $PublishSettingsPath)) {
    throw "Archivo PublishSettings no encontrado: $PublishSettingsPath"
}

# Paso 1: Empaquetar backend
Write-Host "`n[1/6] Empaquetando backend..." -ForegroundColor Yellow
$backendPath = "$PSScriptRoot\..\..\backend"
$zipPath = "$PSScriptRoot\..\..\deploy-backend-diag.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Push-Location $backendPath
try {
    # Usar tar.exe para generar ZIP con rutas POSIX
    $files = @(
        "dist",
        "node_modules",
        "package.json",
        "package-lock.json",
        "start-with-logging.sh",
        "db-diagnose.js"
    )
    
    $tarArgs = @("-a", "-cf", $zipPath) + $files
    & tar.exe $tarArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "tar.exe falló con código $LASTEXITCODE"
    }
    
    $zipSizeMB = [Math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    $sizeText = "$zipSizeMB" + " MB"
    Write-Host "  ✓ ZIP creado: $zipPath ($sizeText)" -ForegroundColor Green
} finally {
    Pop-Location
}

# Paso 2: Cargar credenciales Kudu
Write-Host "`n[2/6] Cargando credenciales Kudu..." -ForegroundColor Yellow
$pp = [xml](Get-Content $PublishSettingsPath)
$prof = $pp.publishData.publishProfile | Where-Object { $_.publishMethod -in 'ZipDeploy','MSDeploy' } | Select-Object -First 1

if (-not $prof) {
    throw "No se encontró perfil de publicación válido en $PublishSettingsPath"
}

$pair = "$($prof.userName):$($prof.userPWD)"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{ 
    Authorization = "Basic $basic"
    'If-Match' = '*'
}
$kuduHost = ($prof.publishUrl -replace ':443','')
Write-Host "  ✓ Kudu: $kuduHost" -ForegroundColor Green

# Paso 3: Desplegar vía Kudu Zip API
Write-Host "`n[3/6] Desplegando backend vía Kudu Zip API..." -ForegroundColor Yellow
$zipApiUrl = "https://$kuduHost/api/zip/site/wwwroot"

try {
    Invoke-RestMethod -Uri $zipApiUrl -Method PUT -Headers $headers `
        -InFile $zipPath -ContentType "application/zip" -TimeoutSec 600 | Out-Null
    Write-Host "  ✓ Deployment completado" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error en deployment: $_" -ForegroundColor Red
    throw
}

# Paso 4: Configurar app settings
Write-Host "`n[4/6] Configurando app settings..." -ForegroundColor Yellow

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
    Write-Host "  → DB_PASS actualizado (longitud: $($DBPassword.Length))" -ForegroundColor Gray
}

$settingsStr = ($settings.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join " "

try {
    $result = az webapp config appsettings set `
        --name lama-backend-dev `
        --resource-group lama-dev-rg `
        --settings $settingsStr `
        --output json 2>&1 | Out-String
    
    Write-Host "  ✓ App settings configurados" -ForegroundColor Green
    Write-Host "    DISABLE_DB=$($settings['DISABLE_DB'])" -ForegroundColor Gray
    Write-Host "    DB_HOST=$($settings['DB_HOST'])" -ForegroundColor Gray
    Write-Host "    DB_NAME=$($settings['DB_NAME'])" -ForegroundColor Gray
} catch {
    Write-Host "  ⚠ Advertencia al configurar settings: $_" -ForegroundColor Yellow
}

# Paso 5: Reiniciar App Service
Write-Host "`n[5/6] Reiniciando App Service..." -ForegroundColor Yellow
try {
    az webapp restart --name lama-backend-dev --resource-group lama-dev-rg --output none 2>&1 | Out-Null
    Write-Host "  ✓ Reinicio iniciado" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Advertencia al reiniciar: $_" -ForegroundColor Yellow
}

Write-Host "`n  Esperando 25 segundos para que el contenedor arranque..." -ForegroundColor Gray
Start-Sleep -Seconds 25

# Paso 6: Leer logs de diagnóstico
Write-Host "`n[6/6] Leyendo logs de diagnóstico..." -ForegroundColor Yellow

$logUrl = "https://$kuduHost/api/vfs/home/LogFiles/app-startup.log"
$dockerLogListUrl = "https://$kuduHost/api/vfs/LogFiles/"

try {
    # Intentar leer app-startup.log
    Write-Host "`n--- Contenido de /home/LogFiles/app-startup.log ---" -ForegroundColor Cyan
    $logContent = Invoke-RestMethod -Uri $logUrl -Headers $headers -TimeoutSec 30
    
    $lines = $logContent -split "`n"
    $relevantLines = $lines | Where-Object {
        $_ -match '\[DB-DIAG|\[WRAPPER\]|Paso 8|ERROR|version\(\)|Conexión|TCP|getent'
    }
    
    if ($relevantLines) {
        $relevantLines | ForEach-Object { Write-Host $_ -ForegroundColor White }
    } else {
        Write-Host "  (Log sin líneas de diagnóstico relevantes, mostrando todo)" -ForegroundColor Yellow
        $lines | Select-Object -Last 50 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
    }
    
} catch {
    Write-Host "  ✗ No se pudo leer app-startup.log: $($_.Exception.Message)" -ForegroundColor Red
    
    # Fallback: intentar Docker logs
    Write-Host "`n  Intentando leer Docker logs..." -ForegroundColor Yellow
    try {
        $dockerLogs = Invoke-RestMethod -Uri $dockerLogListUrl -Headers $headers -TimeoutSec 30
        $latestLog = $dockerLogs | Where-Object { $_.name -like '*docker.log' } | Sort-Object mtime -Descending | Select-Object -First 1
        
        if ($latestLog) {
            $dockerLogUrl = "https://$kuduHost/api/vfs/LogFiles/$($latestLog.name)"
            $dockerContent = Invoke-RestMethod -Uri $dockerLogUrl -Headers $headers -TimeoutSec 30
            Write-Host "`n--- Últimas 30 líneas de $($latestLog.name) ---" -ForegroundColor Cyan
            ($dockerContent -split "`n") | Select-Object -Last 30 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
        }
    } catch {
        Write-Host "  ✗ Tampoco se pudieron leer Docker logs: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Paso 7: Verificar health endpoint
Write-Host "`n--- Verificando /health endpoint ---" -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "https://lama-backend-dev.azurewebsites.net/health" `
        -TimeoutSec 15 -UseBasicParsing
    Write-Host "  ✓ Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "  ✓ Body: $($healthResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Health check falló: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Diagnóstico Completado ===" -ForegroundColor Cyan
Write-Host "Para ver logs en vivo:" -ForegroundColor Gray
Write-Host "  az webapp log tail --name lama-backend-dev --resource-group lama-dev-rg" -ForegroundColor Gray
