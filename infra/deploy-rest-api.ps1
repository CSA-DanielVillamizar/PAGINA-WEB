# Script para desplegar recursos usando Azure REST API directamente
# Esto evita problemas de SSL con Azure CLI

param(
    [string]$ResourceGroup = "lama-foundation-rg",
    [string]$Location = "centralus",
    [string]$PostgresPassword = "LAMAadmin2024!"
)

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "LAMA Foundation - Despliegue con REST API" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Obtener token de acceso
Write-Host "`n[1/4] Obteniendo token de acceso..." -ForegroundColor Yellow
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = "1"
$token = az account get-access-token --query accessToken -o tsv
$subscriptionId = az account show --query id -o tsv

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "✓ Token obtenido" -ForegroundColor Green

# 1. Crear Storage Account
Write-Host "`n[2/4] Creando Storage Account..." -ForegroundColor Yellow
$storageName = "lamastoragecus"
$storageBody = @{
    location = $Location
    sku = @{
        name = "Standard_LRS"
    }
    kind = "StorageV2"
    properties = @{
        minimumTlsVersion = "TLS1_2"
        allowBlobPublicAccess = $false
    }
    tags = @{
        environment = "dev"
        app = "lama"
    }
} | ConvertTo-Json -Depth 10

try {
    $storageUri = "https://management.azure.com/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.Storage/storageAccounts/${storageName}?api-version=2023-01-01"
    $response = Invoke-RestMethod -Method Put -Uri $storageUri -Headers $headers -Body $storageBody
    Write-Host "✓ Storage Account creado: $storageName" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠ Storage Account ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        throw
    }
}

# 2. Crear Key Vault
Write-Host "`n[3/4] Creando Key Vault..." -ForegroundColor Yellow
$kvName = "lama-kv-centralus"
$tenantId = az account show --query tenantId -o tsv

$kvBody = @{
    location = $Location
    properties = @{
        tenantId = $tenantId
        sku = @{
            family = "A"
            name = "standard"
        }
        enableSoftDelete = $true
        enableRbacAuthorization = $true
        publicNetworkAccess = "Enabled"
    }
    tags = @{
        environment = "dev"
        app = "lama"
    }
} | ConvertTo-Json -Depth 10

try {
    $kvUri = "https://management.azure.com/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.KeyVault/vaults/${kvName}?api-version=2023-07-01"
    $response = Invoke-RestMethod -Method Put -Uri $kvUri -Headers $headers -Body $kvBody
    Write-Host "✓ Key Vault creado: $kvName" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠ Key Vault ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        throw
    }
}

# 3. Crear PostgreSQL Flexible Server
Write-Host "`n[4/4] Creando PostgreSQL Flexible Server (puede tomar 5-10 minutos)..." -ForegroundColor Yellow
$pgName = "lama-pg-centralus"

$pgBody = @{
    location = $Location
    sku = @{
        name = "Standard_B1ms"
        tier = "Burstable"
    }
    properties = @{
        administratorLogin = "pgadmin"
        administratorLoginPassword = $PostgresPassword
        version = "16"
        storage = @{
            storageSizeGB = 32
        }
        backup = @{
            backupRetentionDays = 7
            geoRedundantBackup = "Disabled"
        }
        highAvailability = @{
            mode = "Disabled"
        }
        network = @{
            publicNetworkAccess = "Enabled"
        }
    }
    tags = @{
        environment = "dev"
        app = "lama"
    }
} | ConvertTo-Json -Depth 10

try {
    $pgUri = "https://management.azure.com/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup/providers/Microsoft.DBforPostgreSQL/flexibleServers/${pgName}?api-version=2023-06-01-preview"
    
    # Iniciar creación asíncrona
    $response = Invoke-WebRequest -Method Put -Uri $pgUri -Headers $headers -Body $pgBody -UseBasicParsing
    
    if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
        Write-Host "✓ PostgreSQL creación iniciada" -ForegroundColor Green
        
        # Esperar a que termine
        Write-Host "   Esperando a que termine la creación..." -ForegroundColor Gray
        $maxAttempts = 40
        $attempt = 0
        
        do {
            Start-Sleep -Seconds 15
            $attempt++
            Write-Host "   Intento $attempt/$maxAttempts..." -ForegroundColor Gray
            
            try {
                $status = Invoke-RestMethod -Method Get -Uri $pgUri -Headers $headers
                if ($status.properties.state -eq "Ready") {
                    Write-Host "✓ PostgreSQL creado: $pgName" -ForegroundColor Green
                    break
                }
            } catch {
                # Continuar esperando
            }
        } while ($attempt -lt $maxAttempts)
        
        if ($attempt -ge $maxAttempts) {
            Write-Host "⚠ Timeout esperando PostgreSQL. Verificar en Portal." -ForegroundColor Yellow
        }
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠ PostgreSQL ya existe" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        throw
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Despliegue completado!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "`nRecursos:" -ForegroundColor White
Write-Host "  Storage: $storageName" -ForegroundColor Gray
Write-Host "  Key Vault: $kvName" -ForegroundColor Gray
Write-Host "  PostgreSQL: $pgName" -ForegroundColor Gray
