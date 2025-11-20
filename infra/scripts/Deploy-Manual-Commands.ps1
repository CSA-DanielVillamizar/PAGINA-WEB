# ============================================================================
# COMANDOS PARA DESPLIEGUE MANUAL DE INFRAESTRUCTURA BÁSICA DEV
# ============================================================================
# Ejecuta estos comandos UNO POR UNO después de autenticarte correctamente
# con tu tenant: 95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae
# ============================================================================

# PASO 0: AUTENTICACIÓN (ejecuta primero)
Write-Host "PASO 0: Autenticación" -ForegroundColor Yellow
Write-Host "Ejecuta: Connect-AzAccount -TenantId '95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae'" -ForegroundColor Cyan
Write-Host "Luego: Set-AzContext -SubscriptionId 'f301f085-0a60-44df-969a-045b4375d4e7'" -ForegroundColor Cyan
Write-Host ""

# Variables de configuración
$ResourceGroupName = "lama-dev-rg"
$Location = "centralus"
$WebAppName = "lama-backend-dev"
$PlanName = "lama-asp-dev"
$PostgresServerName = "lama-pg-dev"
$PostgresAdminUser = "pgadmin"
$PostgresAdminPassword = "LAMAdev2025!Secure"
$KeyVaultName = "lama-kv-dev99"
$StorageAccountName = "lamastoragedev99"
$InsightsName = "lama-ai-dev"
$DbName = "lama_db"

Write-Host "PASO 1: Verificar Resource Group" -ForegroundColor Yellow
$rgCommand = @"
Get-AzResourceGroup -Name '$ResourceGroupName' -ErrorAction SilentlyContinue
# Si no existe, crear con:
# New-AzResourceGroup -Name '$ResourceGroupName' -Location '$Location'
"@
Write-Host $rgCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 2: Crear App Service Plan" -ForegroundColor Yellow
$planCommand = @"
New-AzAppServicePlan ``
  -Name '$PlanName' ``
  -ResourceGroupName '$ResourceGroupName' ``
  -Location '$Location' ``
  -Tier 'Basic' ``
  -NumberofWorkers 1 ``
  -WorkerSize 'Small' ``
  -Linux
"@
Write-Host $planCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 3: Crear Key Vault (RBAC)" -ForegroundColor Yellow
$kvCommand = @"
New-AzKeyVault ``
  -Name '$KeyVaultName' ``
  -ResourceGroupName '$ResourceGroupName' ``
  -Location '$Location' ``
  -Sku 'Standard' ``
  -EnablePurgeProtection ``
  -EnableRbacAuthorization
"@
Write-Host $kvCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 4: Crear Storage Account" -ForegroundColor Yellow
$storageCommand = @"
New-AzStorageAccount ``
  -Name '$StorageAccountName' ``
  -ResourceGroupName '$ResourceGroupName' ``
  -Location '$Location' ``
  -SkuName 'Standard_LRS' ``
  -Kind 'StorageV2' ``
  -EnableHttpsTrafficOnly `$true ``
  -MinimumTlsVersion 'TLS1_2' ``
  -AllowBlobPublicAccess:`$false
"@
Write-Host $storageCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 5: Crear PostgreSQL Flexible Server" -ForegroundColor Yellow
$pgCommand = @"
New-AzPostgreSqlFlexibleServer ``
  -Name '$PostgresServerName' ``
  -ResourceGroupName '$ResourceGroupName' ``
  -Location '$Location' ``
  -SkuTier 'Burstable' ``
  -SkuName 'Standard_B1ms' ``
  -Version 16 ``
  -StorageSizeGb 32 ``
  -AdministratorUser '$PostgresAdminUser' ``
  -AdministratorPassword (ConvertTo-SecureString '$PostgresAdminPassword' -AsPlainText -Force) ``
  -BackupRetentionDay 7 ``
  -HighAvailability Disabled ``
  -PublicAccess All
"@
Write-Host $pgCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 6: Crear Application Insights" -ForegroundColor Yellow
$insightsCommand = @"
New-AzApplicationInsights ``
  -Name '$InsightsName' ``
  -ResourceGroupName '$ResourceGroupName' ``
  -Location '$Location' ``
  -Kind 'web'
"@
Write-Host $insightsCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 7: Crear Web App (Node 24 LTS)" -ForegroundColor Yellow
$webAppCommand = @"
New-AzWebApp ``
  -Name '$WebAppName' ``
  -ResourceGroupName '$ResourceGroupName' ``
  -Location '$Location' ``
  -AppServicePlan '$PlanName' ``
  -Runtime 'node|24-lts'
"@
Write-Host $webAppCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 8: Habilitar Identidad Administrada en Web App" -ForegroundColor Yellow
$identityCommand = @"
Update-AzWebApp ``
  -Name '$WebAppName' ``
  -ResourceGroupName '$ResourceGroupName' ``
  -AssignIdentity
"@
Write-Host $identityCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 9: Guardar secretos en Key Vault" -ForegroundColor Yellow
$secretsCommand = @"
Set-AzKeyVaultSecret ``
  -VaultName '$KeyVaultName' ``
  -Name 'DB-PASSWORD' ``
  -SecretValue (ConvertTo-SecureString '$PostgresAdminPassword' -AsPlainText -Force)

Set-AzKeyVaultSecret ``
  -VaultName '$KeyVaultName' ``
  -Name 'JWT-SECRET' ``
  -SecretValue (ConvertTo-SecureString ([Guid]::NewGuid().ToString('N')) -AsPlainText -Force)
"@
Write-Host $secretsCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 10: Asignar rol Key Vault Secrets User a Web App" -ForegroundColor Yellow
$roleCommand = @"
`$webApp = Get-AzWebApp -Name '$WebAppName' -ResourceGroupName '$ResourceGroupName'
`$kv = Get-AzKeyVault -VaultName '$KeyVaultName'
New-AzRoleAssignment ``
  -ObjectId `$webApp.Identity.PrincipalId ``
  -RoleDefinitionName 'Key Vault Secrets User' ``
  -Scope `$kv.ResourceId
"@
Write-Host $roleCommand -ForegroundColor Green
Write-Host ""

Write-Host "PASO 11: Configurar App Settings" -ForegroundColor Yellow
$settingsCommand = @"
`$kv = Get-AzKeyVault -VaultName '$KeyVaultName'
`$insights = Get-AzApplicationInsights -ResourceGroupName '$ResourceGroupName' -Name '$InsightsName'
`$kvUri = `$kv.VaultUri.TrimEnd('/')
`$settings = @{
  PORT               = '8080'
  NODE_ENV           = 'production'
  DB_HOST            = '$PostgresServerName.postgres.database.azure.com'
  DB_PORT            = '5432'
  DB_USER            = '$PostgresAdminUser@$PostgresServerName'
  DB_NAME            = '$DbName'
  KEY_VAULT_NAME     = '$KeyVaultName'
  DB_PASSWORD        = "@Microsoft.KeyVault(SecretUri=`$kvUri/secrets/DB-PASSWORD)"
  JWT_SECRET         = "@Microsoft.KeyVault(SecretUri=`$kvUri/secrets/JWT-SECRET)"
  APPINSIGHTS_INSTRUMENTATIONKEY = `$insights.InstrumentationKey
}
Set-AzWebApp -Name '$WebAppName' -ResourceGroupName '$ResourceGroupName' -AppSettings `$settings
"@
Write-Host $settingsCommand -ForegroundColor Green
Write-Host ""

Write-Host "============================================================================" -ForegroundColor Yellow
Write-Host "COPIA Y EJECUTA CADA COMANDO DESPUÉS DE AUTENTICARTE CORRECTAMENTE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Yellow
