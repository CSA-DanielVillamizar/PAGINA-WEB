# Script de despliegue simplificado para desarrollo
# Sin Key Vault - solo lo esencial

param(
    [string]$Location = "centralus",
    [string]$Environment = "dev"
)

$ErrorActionPreference = "Stop"

$projectName = "lama"
$resourceGroupName = "rg-$projectName-$Environment"

Write-Host "=== Despliegue Simplificado - Ambiente $Environment ===" -ForegroundColor Cyan

# Verificar Azure CLI
Write-Host "`n1. Verificando Azure CLI..." -ForegroundColor Yellow
try {
    $azVersion = az version --output json 2>$null | ConvertFrom-Json
    if (-not $azVersion) {
        Write-Error "Azure CLI no responde correctamente"
    }
} catch {
    Write-Error "Azure CLI no está instalado o no funciona correctamente"
}
Write-Host "   Azure CLI: OK" -ForegroundColor Green

# Crear Resource Group
Write-Host "`n2. Creando Resource Group..." -ForegroundColor Yellow
az group create `
    --name $resourceGroupName `
    --location $Location `
    --output none

Write-Host "   Resource Group: $resourceGroupName" -ForegroundColor Green

# Generar secretos
Write-Host "`n3. Generando secretos..." -ForegroundColor Yellow
$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
$postgresPassword = -join ((1..20) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] }) + "!A1"
$jwtSecret = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
Write-Host "   Secretos generados" -ForegroundColor Green

# Desplegar infraestructura
Write-Host "`n4. Desplegando infraestructura..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar 5-10 minutos)" -ForegroundColor Gray

$deployment = az deployment group create `
    --resource-group $resourceGroupName `
    --template-file "main-dev-simple.bicep" `
    --parameters `
        location=$Location `
        environment=$Environment `
        projectName=$projectName `
        postgresAdminPassword=$postgresPassword `
        jwtSecret=$jwtSecret `
        frontendUrl="http://localhost:5173" `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falló el despliegue de infraestructura"
}

Write-Host "   Despliegue completado" -ForegroundColor Green

# Obtener outputs
$webAppName = $deployment.properties.outputs.webAppName.value
$webAppUrl = $deployment.properties.outputs.webAppUrl.value
$postgresHost = $deployment.properties.outputs.postgresHost.value
$storageAccountName = $deployment.properties.outputs.storageAccountName.value

# Guardar configuración
Write-Host "`n5. Guardando configuración..." -ForegroundColor Yellow
$config = @{
    resourceGroup = $resourceGroupName
    webAppName = $webAppName
    webAppUrl = $webAppUrl
    postgresHost = $postgresHost
    postgresPassword = $postgresPassword
    jwtSecret = $jwtSecret
    storageAccountName = $storageAccountName
    deploymentDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$config | ConvertTo-Json | Out-File ".env.$Environment.json" -Encoding UTF8
Write-Host "   Configuración guardada en: infra/.env.$Environment.json" -ForegroundColor Green

# Resumen
Write-Host "`n=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
Write-Host "`nRecursos creados:" -ForegroundColor Cyan
Write-Host "  Resource Group: $resourceGroupName"
Write-Host "  Web App: $webAppName"
Write-Host "  URL: $webAppUrl"
Write-Host "  PostgreSQL: $postgresHost"
Write-Host "  Storage: $storageAccountName"

Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Compilar backend: cd backend && npm run build"
Write-Host "  2. Crear package: infra/scripts/Package-Backend.ps1"
Write-Host "  3. Desplegar: az webapp deployment source config-zip -g $resourceGroupName -n $webAppName --src backend/deploy-backend.zip"

Write-Host "`nCredenciales guardadas en: infra/.env.$Environment.json" -ForegroundColor Cyan
