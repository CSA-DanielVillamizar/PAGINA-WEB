# Script simplificado para desplegar recursos en Azure
param(
    [string]$ResourceGroup = "lama-foundation-rg",
    [string]$Location = "centralus"
)

$ErrorActionPreference = "Continue"
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = "1"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Desplegando recursos en Azure" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 1. Storage Account
Write-Host "`n[1/3] Storage Account..." -ForegroundColor Yellow
$storage = az storage account create `
    --name lamastoragecus `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_LRS `
    --only-show-errors 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Storage creado" -ForegroundColor Green
} else {
    Write-Host "⚠ $storage" -ForegroundColor Yellow
}

# 2. Key Vault
Write-Host "`n[2/3] Key Vault..." -ForegroundColor Yellow
$kv = az keyvault create `
    --name lama-kv-centralus `
    --resource-group $ResourceGroup `
    --location $Location `
    --enable-rbac-authorization `
    --only-show-errors 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Key Vault creado" -ForegroundColor Green
} else {
    Write-Host "⚠ $kv" -ForegroundColor Yellow
}

# 3. PostgreSQL
Write-Host "`n[3/3] PostgreSQL (esto tarda varios minutos)..." -ForegroundColor Yellow
$pg = az postgres flexible-server create `
    --name lama-pg-centralus `
    --resource-group $ResourceGroup `
    --location $Location `
    --admin-user pgadmin `
    --admin-password "LAMAadmin2024!" `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --version 16 `
    --storage-size 32 `
    --backup-retention 7 `
    --yes `
    --only-show-errors 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL creado" -ForegroundColor Green
    
    # Crear database
    Write-Host "   Creando base de datos..." -ForegroundColor Gray
    az postgres flexible-server db create `
        --resource-group $ResourceGroup `
        --server-name lama-pg-centralus `
        --database-name lama_db `
        --only-show-errors
    
    # Firewall
    Write-Host "   Configurando firewall..." -ForegroundColor Gray
    az postgres flexible-server firewall-rule create `
        --resource-group $ResourceGroup `
        --name lama-pg-centralus `
        --rule-name AllowAllAzureIps `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 0.0.0.0 `
        --only-show-errors
        
    Write-Host "✓ Database y firewall configurados" -ForegroundColor Green
} else {
    Write-Host "⚠ $pg" -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Verificando recursos..." -ForegroundColor Yellow
az resource list -g $ResourceGroup --query "[].{Name:name, Type:type}" -o table

Write-Host "`nSiguiente paso: Configurar App Registration" -ForegroundColor Yellow
Write-Host "Ver: AZURE_PORTAL_SETUP.md (Sección 4)" -ForegroundColor Gray
