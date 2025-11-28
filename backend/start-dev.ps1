# Script para desarrollo local del backend
# Configura variables de entorno y arranca el servidor

Write-Host "=== LAMA Backend - Desarrollo Local ===" -ForegroundColor Cyan
Write-Host ""

# Variables de entorno para desarrollo local
$env:NODE_ENV = "development"
$env:PORT = "3000"
$env:DISABLE_DB = "1"  # Cambiar a 0 cuando quieras conectar a PostgreSQL
$env:ENABLE_SWAGGER = "0"  # Cambiar a 1 si necesitas Swagger
$env:FRONTEND_URL = "http://localhost:5173"
$env:FEATURE_BLOB_REQUIRED = "false"
$env:FEATURE_EMAIL_REQUIRED = "false"

Write-Host "✓ Variables de entorno configuradas:" -ForegroundColor Green
Write-Host "  NODE_ENV: $env:NODE_ENV"
Write-Host "  PORT: $env:PORT"
Write-Host "  DISABLE_DB: $env:DISABLE_DB"
Write-Host "  ENABLE_SWAGGER: $env:ENABLE_SWAGGER"
Write-Host ""

# Verificar que dist existe
if (-not (Test-Path "dist/main.js")) {
    Write-Host "⚠ Carpeta dist no encontrada. Compilando..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error en compilación" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🚀 Iniciando backend en http://localhost:3000" -ForegroundColor Green
Write-Host "   Health check: http://localhost:3000/health" -ForegroundColor Gray
Write-Host "   API docs (si SWAGGER=1): http://localhost:3000/api/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor
node dist/main.js
