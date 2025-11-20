<#
.SYNOPSIS
  Script simplificado de despliegue de infraestructura de desarrollo.
.DESCRIPTION
  Despliega en un solo paso: Resource Group + plantilla main-dev-basic.bicep.
  Luego crea secretos en Key Vault y muestra outputs finales.
  Evita VNets privadas y configuración compleja. Ideal para ambiente dev rápido.
.PARAMETER ResourceGroupName
  Nombre del grupo de recursos a crear/usar.
.PARAMETER Location
  Región de Azure (ej: centralus).
.PARAMETER WebAppName
  Nombre DNS de la Web App.
.PARAMETER PlanName
  Nombre del App Service Plan.
.PARAMETER PostgresServerName
  Nombre del servidor PostgreSQL.
.PARAMETER PostgresAdminPassword
  Contraseña administrador PostgreSQL (mínimo 8 caracteres, alfanumérico + especial).
.PARAMETER KeyVaultName
  Nombre del Key Vault (3-24 caracteres, alfanumérico, globalmente único).
.PARAMETER StorageAccountName
  Nombre de Storage Account (3-24 caracteres, sin guiones, todo minúsculas).
.PARAMETER InsightsName
  Nombre de Application Insights.
.EXAMPLE
  .\Deploy-Dev-Basic.ps1 -ResourceGroupName lama-dev-rg -Location centralus -WebAppName lama-backend-dev -PlanName lama-asp-dev -PostgresServerName lama-pg-dev -PostgresAdminPassword "LAMAdev2025!Secure" -KeyVaultName lama-kv-dev99 -StorageAccountName lamastoragedev99 -InsightsName lama-ai-dev
#>
param(
  [Parameter(Mandatory=$true)][string]$ResourceGroupName,
  [Parameter(Mandatory=$true)][string]$Location,
  [Parameter(Mandatory=$true)][string]$WebAppName,
  [Parameter(Mandatory=$true)][string]$PlanName,
  [Parameter(Mandatory=$true)][string]$PostgresServerName,
  [Parameter(Mandatory=$true)][string]$PostgresAdminPassword,
  [Parameter(Mandatory=$true)][string]$KeyVaultName,
  [Parameter(Mandatory=$true)][string]$StorageAccountName,
  [Parameter(Mandatory=$true)][string]$InsightsName
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Step($m){ Write-Host "[STEP] $m" -ForegroundColor Green }
function Write-Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err($m){ Write-Host "[ERROR] $m" -ForegroundColor Red }

Write-Step "Iniciando despliegue de ambiente de desarrollo básico"

# 1. Crear Resource Group si no existe
Write-Step "Verificando/Creando Resource Group"
$rg = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if(-not $rg){
  Write-Info "Creando RG $ResourceGroupName en $Location..."
  New-AzResourceGroup -Name $ResourceGroupName -Location $Location | Out-Null
} else {
  Write-Info "RG ya existe: $ResourceGroupName"
}

# 2. Desplegar infraestructura con Bicep
Write-Step "Desplegando infraestructura (main-dev-basic.bicep)"
$bicepFile = Join-Path $PSScriptRoot 'main-dev-basic.bicep'
if(-not (Test-Path $bicepFile)){ throw "Bicep file no encontrado: $bicepFile" }

$deployParams = @{
  ResourceGroupName = $ResourceGroupName
  TemplateFile = $bicepFile
  webAppName = $WebAppName
  planName = $PlanName
  postgresServerName = $PostgresServerName
  postgresAdminPassword = (ConvertTo-SecureString $PostgresAdminPassword -AsPlainText -Force)
  keyVaultName = $KeyVaultName
  storageAccountName = $StorageAccountName
  insightsName = $InsightsName
  Verbose = $true
}

$deployment = New-AzResourceGroupDeployment @deployParams

Write-Info "Despliegue completado. Outputs:"
$deployment.Outputs.Keys | ForEach-Object {
  Write-Info "$_ : $($deployment.Outputs[$_].Value)"
}

# 3. Guardar secretos en Key Vault (DB-PASSWORD, JWT-SECRET)
Write-Step "Creando secretos en Key Vault"
$jwtSecret = [System.Guid]::NewGuid().ToString('N')
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name 'DB-PASSWORD' -SecretValue (ConvertTo-SecureString $PostgresAdminPassword -AsPlainText -Force) | Out-Null
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name 'JWT-SECRET' -SecretValue (ConvertTo-SecureString $jwtSecret -AsPlainText -Force) | Out-Null
Write-Info "Secretos guardados: DB-PASSWORD, JWT-SECRET"

# 4. Configurar App Settings con referencias a Key Vault
Write-Step "Configurando App Settings con referencias a Key Vault"
$kvUri = $deployment.Outputs['keyVaultUri'].Value.TrimEnd('/')
$webAppSettings = @{
  PORT               = '8080'
  NODE_ENV           = 'production'
  DB_HOST            = $deployment.Outputs['postgresFqdn'].Value
  DB_PORT            = '5432'
  DB_USER            = "pgadmin@$PostgresServerName"
  DB_NAME            = 'lama_db'
  KEY_VAULT_NAME     = $KeyVaultName
  DB_PASSWORD        = "@Microsoft.KeyVault(SecretUri=$kvUri/secrets/DB-PASSWORD)"
  JWT_SECRET         = "@Microsoft.KeyVault(SecretUri=$kvUri/secrets/JWT-SECRET)"
  APPINSIGHTS_INSTRUMENTATIONKEY = $deployment.Outputs['insightsKey'].Value
}
Set-AzWebApp -Name $WebAppName -ResourceGroupName $ResourceGroupName -AppSettings $webAppSettings | Out-Null
Write-Info "App Settings configurados correctamente."

# 5. Resumen final
Write-Step "INFRAESTRUCTURA CREADA EXITOSAMENTE"
Write-Info "Web App URL: $($deployment.Outputs['webAppUrl'].Value)"
Write-Info "PostgreSQL FQDN: $($deployment.Outputs['postgresFqdn'].Value)"
Write-Info "Key Vault URI: $kvUri"
Write-Info "Application Insights Key: $($deployment.Outputs['insightsKey'].Value)"
Write-Info ""
Write-Info "Próximos pasos recomendados:"
Write-Info "1. Desplegar código de la aplicación (GitHub Actions o manual)."
Write-Info "2. Ejecutar migraciones de base de datos (npm run migrate desde Kudu)."
Write-Info "3. Verificar health endpoints: /health y /health/ready"
Write-Info "4. Revisar logs en Application Insights."

