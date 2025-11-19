# Script para desplegar infraestructura en Central US
# Ejecutar con: .\deploy-centralus.ps1

$ErrorActionPreference = "Stop"
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = "1"

$resourceGroup = "lama-foundation-rg"
$location = "centralus"
$storageName = "lamastoragecus"
$keyVaultName = "lama-kv-centralus"
$postgresName = "lama-pg-centralus"
$postgresPassword = "LAMAadmin2024!"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "LAMA Foundation - Despliegue Azure" -ForegroundColor Cyan
Write-Host "Resource Group: $resourceGroup" -ForegroundColor Cyan
Write-Host "Location: $location" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Storage Account
Write-Host "[1/3] Creando Storage Account..." -ForegroundColor Yellow
try {
    az storage account create `
        --name $storageName `
        --resource-group $resourceGroup `
        --location $location `
        --sku Standard_LRS `
        --kind StorageV2 `
        --min-tls-version TLS1_2 `
        --allow-blob-public-access false `
        --only-show-errors
    Write-Host "✓ Storage Account creado: $storageName" -ForegroundColor Green
} catch {
    Write-Host "✗ Error creando Storage Account: $_" -ForegroundColor Red
}

# 2. Key Vault
Write-Host "[2/3] Creando Key Vault..." -ForegroundColor Yellow
try {
    az keyvault create `
        --name $keyVaultName `
        --resource-group $resourceGroup `
        --location $location `
        --enable-rbac-authorization `
        --only-show-errors
    Write-Host "✓ Key Vault creado: $keyVaultName" -ForegroundColor Green
} catch {
    Write-Host "✗ Error creando Key Vault: $_" -ForegroundColor Red
}

# 3. PostgreSQL Flexible Server
Write-Host "[3/3] Creando PostgreSQL Flexible Server (esto puede tomar 5-10 minutos)..." -ForegroundColor Yellow
try {
    az postgres flexible-server create `
        --name $postgresName `
        --resource-group $resourceGroup `
        --location $location `
        --admin-user pgadmin `
        --admin-password $postgresPassword `
        --sku-name Standard_B1ms `
        --tier Burstable `
        --version 16 `
        --storage-size 32 `
        --backup-retention 7 `
        --yes `
        --only-show-errors
    Write-Host "✓ PostgreSQL creado: $postgresName" -ForegroundColor Green
    
    # Crear base de datos
    Write-Host "   Creando base de datos lama_db..." -ForegroundColor Yellow
    az postgres flexible-server db create `
        --resource-group $resourceGroup `
        --server-name $postgresName `
        --database-name lama_db `
        --only-show-errors
    Write-Host "   ✓ Base de datos creada" -ForegroundColor Green
    
    # Configurar firewall para Azure services
    Write-Host "   Configurando firewall..." -ForegroundColor Yellow
    az postgres flexible-server firewall-rule create `
        --resource-group $resourceGroup `
        --name $postgresName `
        --rule-name AllowAllAzureIps `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 0.0.0.0 `
        --only-show-errors
    Write-Host "   ✓ Firewall configurado" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Error creando PostgreSQL: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Despliegue completado!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recursos creados:" -ForegroundColor White
Write-Host "  - Storage Account: $storageName" -ForegroundColor Gray
Write-Host "  - Key Vault: $keyVaultName" -ForegroundColor Gray
Write-Host "  - PostgreSQL: $postgresName" -ForegroundColor Gray
Write-Host "  - Database: lama_db" -ForegroundColor Gray
Write-Host ""
Write-Host "Siguiente paso: Configurar App Registration en Azure Portal" -ForegroundColor Yellow
Write-Host "Ver guía: MSAL_MULTI_TENANT_GUIDE.md" -ForegroundColor Yellow
