# Quick Deploy Frontend
$ErrorActionPreference = "Stop"

Write-Host "=== LAMA Frontend Quick Deploy ===" -ForegroundColor Cyan
Write-Host ""

# Get credentials
Write-Host "Obteniendo credenciales..." -ForegroundColor Yellow
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION='1'
$credsJson = az webapp deployment list-publishing-credentials `
    --name lama-frontend-dev `
    --resource-group lama-dev-rg 2>&1 | `
    Where-Object { $_ -notmatch 'Warning|InsecureRequestWarning|urllib3' } | `
    Out-String

$creds = $credsJson | ConvertFrom-Json
$user = $creds.publishingUserName
$pass = $creds.publishingPassword

if (-not $user -or -not $pass) {
    Write-Host "ERROR: No se pudieron obtener credenciales" -ForegroundColor Red
    exit 1
}

$pair = "${user}:${pass}"
$base64 = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{ Authorization = "Basic $base64" }

Write-Host "Credenciales OK" -ForegroundColor Green
Write-Host ""

# Check files
Write-Host "Verificando archivos desplegados..." -ForegroundColor Yellow
try {
    $files = Invoke-RestMethod `
        -Uri "https://lama-frontend-dev.scm.azurewebsites.net/api/vfs/site/wwwroot/" `
        -Headers $headers `
        -TimeoutSec 15
    
    Write-Host "Archivos en wwwroot:" -ForegroundColor Cyan
    $files | Select-Object name, size | Format-Table -AutoSize
    
    $hasServer = $files | Where-Object { $_.name -eq 'server.js' }
    $hasNodeModules = $files | Where-Object { $_.name -eq 'node_modules' }
    $hasNext = $files | Where-Object { $_.name -eq '.next' }
    
    if ($hasServer -and $hasNodeModules -and $hasNext) {
        Write-Host "Estructura OK" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Faltan archivos criticos" -ForegroundColor Red
        Write-Host "server.js: $(if($hasServer){'SI'}else{'NO'})" -ForegroundColor $(if($hasServer){'Green'}else{'Red'})
        Write-Host "node_modules: $(if($hasNodeModules){'SI'}else{'NO'})" -ForegroundColor $(if($hasNodeModules){'Green'}else{'Red'})
        Write-Host ".next: $(if($hasNext){'SI'}else{'NO'})" -ForegroundColor $(if($hasNext){'Green'}else{'Red'})
    }
} catch {
    Write-Host "Error verificando archivos: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificando sitio..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://lama-frontend-dev.azurewebsites.net" -TimeoutSec 15 -UseBasicParsing
    Write-Host "SITIO FUNCIONA!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Sitio no responde: $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "Obteniendo logs recientes..." -ForegroundColor Yellow
    try {
        $logStream = Invoke-RestMethod `
            -Uri "https://lama-frontend-dev.scm.azurewebsites.net/api/logstream/application" `
            -Headers $headers `
            -TimeoutSec 5
        Write-Host $logStream
    } catch {
        Write-Host "No se pudieron obtener logs en tiempo real" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Fin ===" -ForegroundColor Cyan
