<#
.SYNOPSIS
  Configura variables de entorno SMTP (Office 365) para desarrollo local.
  
.DESCRIPTION
  Establece variables de entorno para el proceso PowerShell actual.
  Útil para desarrollo local antes de ejecutar npm run start:dev.
  
  NO almacena secretos en archivos; solo en memoria del proceso.
  
.PARAMETER SmtpPass
  Contraseña del buzón SMTP. Requerida.
  
.PARAMETER DbPass
  Contraseña de PostgreSQL. Opcional para pruebas sin DB.
  
.EXAMPLE
  .\Setup-Email-Local.ps1 -SmtpPass "MiContraseña123" -DbPass "postgres123"
  npm run start:dev
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$SmtpPass,
  
  [Parameter(Mandatory=$false)]
  [string]$DbPass = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Configurando variables de entorno SMTP " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Email SMTP (Office 365)
$env:SMTP_HOST = "smtp.office365.com"
$env:SMTP_PORT = "587"
$env:SMTP_SECURE = "false"
$env:SMTP_USER = "gerencia@fundacionlamamedellin.org"
$env:SMTP_PASS = $SmtpPass
$env:SMTP_FROM = "gerencia@fundacionlamamedellin.org"

# Destinatario de inscripciones
$env:INSCRIPTIONS_RECEIVER = "gerencia@fundacionlamamedellin.org"

# Configuración servidor
$env:PORT = "8080"
$env:NODE_ENV = "development"
$env:FRONTEND_URL = "http://localhost:5173"

# Feature flags
$env:ENABLE_SWAGGER = "0"
$env:DISABLE_DB = "0"
$env:FEATURE_EMAIL_REQUIRED = "false"

# Database (opcional)
if ($DbPass) {
  $env:DB_HOST = "localhost"
  $env:DB_PORT = "5432"
  $env:DB_USER = "postgres"
  $env:DB_PASS = $DbPass
  $env:DB_NAME = "lama_db"
  $env:DB_SSL = "0"
  Write-Host "[✓] Database configurada" -ForegroundColor Green
}

Write-Host "[✓] SMTP configurado: smtp.office365.com:587" -ForegroundColor Green
Write-Host "[✓] Usuario: gerencia@fundacionlamamedellin.org" -ForegroundColor Green
Write-Host "[✓] Destinatario inscripciones: gerencia@fundacionlamamedellin.org" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor Yellow
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "Prueba email:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:8080/api/diagnostics/email?to=tucorreo@ejemplo.com" -ForegroundColor White
