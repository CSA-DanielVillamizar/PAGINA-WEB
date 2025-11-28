<#
.SYNOPSIS
  Prueba completa de envío de email SMTP desde el backend.
  
.DESCRIPTION
  1. Configura variables de entorno SMTP.
  2. Arranca el backend en modo dev (puerto 8080).
  3. Espera que el servidor levante.
  4. Envía una prueba de email vía endpoint de diagnóstico.
  5. Muestra logs y resultado.
  
.PARAMETER To
  Dirección de correo destino para la prueba.
  
.PARAMETER SmtpPass
  Contraseña del buzón SMTP.
  
.EXAMPLE
  .\Test-Email-SMTP.ps1 -To "danielvillamizara@gmail.com" -SmtpPass "FLM902007705-8*"
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$To,
  
  [Parameter(Mandatory=$true)]
  [string]$SmtpPass
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Prueba de Email SMTP (Office 365)     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configurar variables
$env:SMTP_HOST = "smtp.office365.com"
$env:SMTP_PORT = "587"
$env:SMTP_SECURE = "false"
$env:SMTP_USER = "gerencia@fundacionlamamedellin.org"
$env:SMTP_PASS = $SmtpPass
$env:SMTP_FROM = "gerencia@fundacionlamamedellin.org"
$env:INSCRIPTIONS_RECEIVER = "gerencia@fundacionlamamedellin.org"
$env:PORT = "8080"
$env:FRONTEND_URL = "http://localhost:5173"
$env:DISABLE_DB = "1"
$env:NODE_ENV = "development"

Write-Host "[INFO] Variables SMTP configuradas" -ForegroundColor Cyan
Write-Host "       Host: smtp.office365.com:587" -ForegroundColor Gray
Write-Host "       User: gerencia@fundacionlamamedellin.org" -ForegroundColor Gray

# Verificar que no haya otro proceso en 8080
$existingProcess = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($existingProcess) {
  Write-Host "[WARN] Puerto 8080 ya está en uso. Intenta cerrar otros procesos." -ForegroundColor Yellow
  exit 1
}

Write-Host "[INFO] Arrancando backend en modo dev..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  npm run start:dev
}

Write-Host "[INFO] Esperando que el servidor levante (15s)..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Verificar que el servidor esté arriba
try {
  $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET -TimeoutSec 5
  Write-Host "[✓] Backend respondiendo: $($health.status)" -ForegroundColor Green
} catch {
  Write-Host "[ERROR] Backend no responde en http://localhost:8080/health" -ForegroundColor Red
  Write-Host "        Verifica logs con: Receive-Job -Job `$backendJob" -ForegroundColor Yellow
  Stop-Job -Job $backendJob
  Remove-Job -Job $backendJob
  exit 1
}

# Enviar email de prueba
Write-Host "[INFO] Enviando email de prueba a: $To" -ForegroundColor Cyan
try {
  $response = Invoke-RestMethod -Uri "http://localhost:8080/api/diagnostics/email?to=$To" -Method GET -TimeoutSec 10
  Write-Host "[✓] Respuesta del servidor:" -ForegroundColor Green
  $response | ConvertTo-Json -Depth 3 | Write-Host
  
  if ($response.enabled -eq $true -and $response.sentTo) {
    Write-Host ""
    Write-Host "[SUCCESS] Email enviado correctamente a: $($response.sentTo)" -ForegroundColor Green
    Write-Host "          Revisa la bandeja de entrada (puede tardar 1-2 min)." -ForegroundColor Green
  } elseif ($response.sendError) {
    Write-Host ""
    Write-Host "[ERROR] Fallo al enviar: $($response.sendError)" -ForegroundColor Red
  } else {
    Write-Host ""
    Write-Host "[WARN] Email no habilitado o sin respuesta clara." -ForegroundColor Yellow
  }
} catch {
  Write-Host "[ERROR] Fallo al llamar endpoint: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona Ctrl+C para detener el backend o cierra esta ventana." -ForegroundColor Yellow
Receive-Job -Job $backendJob -Wait
Stop-Job -Job $backendJob
Remove-Job -Job $backendJob
