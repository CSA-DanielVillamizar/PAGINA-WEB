# ============================================================================
# SCRIPT DE FINALIZACIÓN - CONFIGURACIÓN COMPLETA DE INFRAESTRUCTURA
# ============================================================================
# Ejecuta este script para terminar la configuración de la infraestructura
# Los siguientes recursos YA FUERON CREADOS exitosamente:
#   ✅ Resource Group: lama-dev-rg
#   ✅ App Service Plan: lama-asp-dev
#   ✅ Key Vault: lama-kv-dev99
#   ✅ Storage Account: lamastoragedev99
#   ✅ PostgreSQL: lama-pg-dev (lama-pg-dev.postgres.database.azure.com)
#   ✅ Application Insights: lama-ai-dev
#   ✅ Web App: lama-backend-dev
#
# Este script completa:
#   - Habilitar identidad administrada en Web App
#   - Configurar runtime Node 24 LTS
#   - Guardar secretos en Key Vault
#   - Asignar rol Key Vault Secrets User
#   - Configurar App Settings con referencias a Key Vault
# ============================================================================

$ErrorActionPreference = 'Stop'
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = 1

# Variables
$ResourceGroupName = "lama-dev-rg"
$WebAppName = "lama-backend-dev"
$KeyVaultName = "lama-kv-dev99"
$PostgresServerName = "lama-pg-dev"
$PostgresAdminPassword = "LAMAdev2025!Secure"
$InsightsName = "lama-ai-dev"

Write-Host "`n=== PASO 1: Configurar Web App ===" -ForegroundColor Cyan

# Habilitar identidad administrada
Write-Host "Habilitando identidad administrada..." -ForegroundColor Yellow
az webapp identity assign --name $WebAppName --resource-group $ResourceGroupName

# Configurar HTTPS Only
Write-Host "Configurando HTTPS only..." -ForegroundColor Yellow
az webapp update --name $WebAppName --resource-group $ResourceGroupName --https-only true

# Configurar runtime Node 24
Write-Host "Configurando runtime Node 24 LTS..." -ForegroundColor Yellow
az webapp config set --name $WebAppName --resource-group $ResourceGroupName --linux-fx-version "NODE|24-lts"

Write-Host "`n=== PASO 2: Guardar secretos en Key Vault ===" -ForegroundColor Cyan

# Generar JWT Secret
$jwtSecret = [System.Guid]::NewGuid().ToString('N')

Write-Host "Guardando DB-PASSWORD..." -ForegroundColor Yellow
az keyvault secret set --vault-name $KeyVaultName --name "DB-PASSWORD" --value $PostgresAdminPassword

Write-Host "Guardando JWT-SECRET..." -ForegroundColor Yellow
az keyvault secret set --vault-name $KeyVaultName --name "JWT-SECRET" --value $jwtSecret

Write-Host "`n=== PASO 3: Asignar rol Key Vault Secrets User ===" -ForegroundColor Cyan

# Obtener principal ID de la Web App
$principalId = (az webapp identity show --name $WebAppName --resource-group $ResourceGroupName --query principalId -o tsv)
Write-Host "Principal ID de Web App: $principalId" -ForegroundColor Green

# Obtener resource ID del Key Vault
$kvId = (az keyvault show --name $KeyVaultName --query id -o tsv)
Write-Host "Key Vault ID: $kvId" -ForegroundColor Green

# Asignar rol
Write-Host "Asignando rol Key Vault Secrets User..." -ForegroundColor Yellow
az role assignment create --assignee $principalId --role "Key Vault Secrets User" --scope $kvId

Write-Host "`n=== PASO 4: Configurar App Settings ===" -ForegroundColor Cyan

# Obtener Key Vault URI
$kvUri = (az keyvault show --name $KeyVaultName --query properties.vaultUri -o tsv).TrimEnd('/')

# Obtener Instrumentation Key de Application Insights
$insightsKey = (az monitor app-insights component show --app $InsightsName --resource-group $ResourceGroupName --query instrumentationKey -o tsv)

Write-Host "Configurando App Settings..." -ForegroundColor Yellow
az webapp config appsettings set --name $WebAppName --resource-group $ResourceGroupName --settings `
  PORT="8080" `
  NODE_ENV="production" `
  DB_HOST="$PostgresServerName.postgres.database.azure.com" `
  DB_PORT="5432" `
  DB_USER="pgadmin@$PostgresServerName" `
  DB_NAME="lama_db" `
  KEY_VAULT_NAME="$KeyVaultName" `
  DB_PASSWORD="@Microsoft.KeyVault(SecretUri=$kvUri/secrets/DB-PASSWORD)" `
  JWT_SECRET="@Microsoft.KeyVault(SecretUri=$kvUri/secrets/JWT-SECRET)" `
  APPINSIGHTS_INSTRUMENTATIONKEY="$insightsKey"

Write-Host "`n=== ✅ INFRAESTRUCTURA COMPLETADA EXITOSAMENTE ===" -ForegroundColor Green
Write-Host "`nRecursos creados:" -ForegroundColor Cyan
Write-Host "  • Web App URL: https://$WebAppName.azurewebsites.net" -ForegroundColor White
Write-Host "  • PostgreSQL: $PostgresServerName.postgres.database.azure.com" -ForegroundColor White
Write-Host "  • Key Vault: $kvUri" -ForegroundColor White
Write-Host "  • Application Insights Key: $insightsKey" -ForegroundColor White

Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Desplegar código: Usar GitHub Actions o az webapp deployment" -ForegroundColor White
Write-Host "  2. Crear base de datos 'lama_db' en PostgreSQL" -ForegroundColor White
Write-Host "  3. Ejecutar migraciones: npm run migrate" -ForegroundColor White
Write-Host "  4. Verificar endpoints: /health y /health/ready" -ForegroundColor White
Write-Host "  5. Revisar logs en Application Insights`n" -ForegroundColor White
