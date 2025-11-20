# Script: Get-Live-Logs.ps1
# Descripción: Obtiene logs recientes de la WebApp

$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = 1

Write-Host "`n=== LOGS RECIENTES DE LAMA-BACKEND-DEV ===" -ForegroundColor Cyan
Write-Host "Obteniendo últimas 50 líneas...`n" -ForegroundColor Yellow

try {
    # Obtener logs via az webapp log download
    $tempDir = "$env:TEMP\lama-logs"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    Write-Host "Descargando logs..." -ForegroundColor Yellow
    az webapp log download `
        --name lama-backend-dev `
        --resource-group lama-dev-rg `
        --log-file "$tempDir\logs.zip" 2>$null
    
    if (Test-Path "$tempDir\logs.zip") {
        Expand-Archive -Path "$tempDir\logs.zip" -DestinationPath "$tempDir\extracted" -Force
        
        # Buscar el log más reciente
        $logFiles = Get-ChildItem -Path "$tempDir\extracted" -Recurse -Filter "*.log" | 
                    Where-Object { $_.Name -match "default_docker" } |
                    Sort-Object LastWriteTime -Descending |
                    Select-Object -First 1
        
        if ($logFiles) {
            Write-Host "`nÚltimas 50 líneas del log:" -ForegroundColor Green
            Get-Content $logFiles.FullName -Tail 50
        } else {
            Write-Host "No se encontraron logs default_docker" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No se pudo descargar el archivo de logs" -ForegroundColor Red
    }
    
    # Limpiar
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n=== ACCIONES RECOMENDADAS ===" -ForegroundColor Magenta
Write-Host "1. Ver logs en Portal: https://portal.azure.com" -ForegroundColor White
Write-Host "   → Busca 'lama-backend-dev' → Monitoring → Log stream`n" -ForegroundColor White
Write-Host "2. Acceder a Kudu: https://lama-backend-dev.scm.azurewebsites.net" -ForegroundColor White
Write-Host "   → Bash → cd /home/LogFiles`n" -ForegroundColor White
