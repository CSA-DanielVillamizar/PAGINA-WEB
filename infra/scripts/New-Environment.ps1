<#!
.SYNOPSIS
  Crea toda la infraestructura base (RG, Log Analytics, App Insights, VNet, PostgreSQL privado, Storage, Key Vault, App Service Plan + Web App, roles) para el backend.
.DESCRIPTION
  Aplica buenas prácticas: RBAC, TLS, acceso privado a PostgreSQL, identidad administrada, diagnósticos, tags. Genera salidas al final.
.PARAMETER ResourceGroupName
  Nombre del nuevo Resource Group.
.PARAMETER Location
  Región (ej: centralus).
.PARAMETER WebAppName
  Nombre DNS de la Web App.
.PARAMETER PlanName
  Nombre del App Service Plan.
.PARAMETER PostgresServerName
  Nombre del servidor PostgreSQL Flexible.
.PARAMETER PostgresAdminPassword
  Password administrador (se guardará en Key Vault).
.PARAMETER KeyVaultName
  Nombre para el Key Vault.
.PARAMETER StorageAccountName
  Nombre único para la cuenta de Storage.
.PARAMETER InsightsName
  Nombre de Application Insights.
.PARAMETER LogAnalyticsName
  Nombre del Log Analytics Workspace.
.PARAMETER VNetName
  Nombre de la VNet.
.PARAMETER SubnetAppServiceName
  Nombre subnet App Service integration.
.PARAMETER SubnetPostgresName
  Nombre subnet PostgreSQL privada.
.PARAMETER Tags
  Hashtable de tags comunes.
.EXAMPLE
  ./New-Environment.ps1 -ResourceGroupName lama-dev-rg -Location centralus -WebAppName lama-backend-dev -PlanName lama-asp-dev -PostgresServerName lama-pg-dev2 -PostgresAdminPassword 'S3guro!' -KeyVaultName lama-kv-dev -StorageAccountName lamastoragedev -InsightsName lama-ai-dev -LogAnalyticsName lama-law-dev -VNetName lama-dev-vnet -SubnetAppServiceName snet-appsvc -SubnetPostgresName snet-pg
#>
param(
  [Parameter(Mandatory=$true)][string]$ResourceGroupName,
  [Parameter(Mandatory=$true)][string]$Location,
  [Parameter(Mandatory=$true)][string]$WebAppName,
  [Parameter(Mandatory=$true)][string]$PlanName,
  [Parameter(Mandatory=$true)][string]$PostgresServerName,
  [Parameter(Mandatory=$true)][string]$PostgresAdminPassword,
  [Parameter()][string]$PostgresAdminUser = 'pgadmin',
  [Parameter(Mandatory=$true)][string]$KeyVaultName,
  [Parameter(Mandatory=$true)][string]$StorageAccountName,
  [Parameter(Mandatory=$true)][string]$InsightsName,
  [Parameter(Mandatory=$true)][string]$LogAnalyticsName,
  [Parameter(Mandatory=$true)][string]$VNetName,
  [Parameter(Mandatory=$true)][string]$SubnetAppServiceName,
  [Parameter(Mandatory=$true)][string]$SubnetPostgresName,
  [hashtable]$Tags = @{ environment='dev'; owner='lama'; costCenter='foundation'; workload='backend-api' }
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Step($m){ Write-Host "[STEP] $m" -ForegroundColor Green }
function Write-Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err($m){ Write-Host "[ERROR] $m" -ForegroundColor Red }

Write-Step "Creando Resource Group (idempotente)";
$rg = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if(-not $rg){
  Write-Info "RG no existe, creando..."
  New-AzResourceGroup -Name $ResourceGroupName -Location $Location -Tag $Tags | Out-Null
} else {
  Write-Info "RG ya existe, se reutiliza."
}

Write-Step "Creando Log Analytics Workspace";
# Ajuste SKU: Standard ya no permitido para creación nueva; usar PerGB2018 (modelo moderno de facturación).
try {
  $law = New-AzOperationalInsightsWorkspace -ResourceGroupName $ResourceGroupName -Name $LogAnalyticsName -Location $Location -Sku PerGB2018 -RetentionInDays 30 -Tag $Tags
} catch {
  Write-Warn "Fallo creación Workspace con PerGB2018: $($_.Exception.Message)"
  throw
}

Write-Step "Creando Application Insights (workspace based)";
$insights = New-AzApplicationInsights -ResourceGroupName $ResourceGroupName -Name $InsightsName -Location $Location -WorkspaceResourceId $law.ResourceId -Kind web

Write-Step "Creando VNet y subnets";
$vnet = New-AzVirtualNetwork -Name $VNetName -ResourceGroupName $ResourceGroupName -Location $Location -AddressPrefix '10.60.0.0/16'
Add-AzVirtualNetworkSubnetConfig -Name $SubnetAppServiceName -AddressPrefix '10.60.10.0/24' -VirtualNetwork $vnet | Out-Null
Add-AzVirtualNetworkSubnetConfig -Name $SubnetPostgresName -AddressPrefix '10.60.20.0/24' -VirtualNetwork $vnet -Delegation (New-AzDelegation -Name pgDelegation -ServiceName Microsoft.DBforPostgreSQL/flexibleServers) | Out-Null
$vnet | Set-AzVirtualNetwork | Out-Null

Write-Step "Creando Private DNS Zone para PostgreSQL (si módulo disponible)";
$privateDnsSupported = $null -ne (Get-Command -Name New-AzPrivateDnsZone -ErrorAction SilentlyContinue)
if($privateDnsSupported){
  $dnsZone = New-AzPrivateDnsZone -Name 'privatelink.postgres.database.azure.com' -ResourceGroupName $ResourceGroupName
  New-AzPrivateDnsVirtualNetworkLink -ZoneName $dnsZone.Name -ResourceGroupName $ResourceGroupName -Name "$VNetName-link" -VirtualNetworkId $vnet.Id -EnableRegistration:$false | Out-Null
  Write-Info "Zona privada creada correctamente."
} else {
  Write-Warn "Módulo Az.PrivateDns no instalado. Se continuará SIN zona privada (PostgreSQL usará FQDN público si se habilita acceso). Instala con: Install-Module Az.PrivateDns -Force"
}

Write-Step "Creando Key Vault (RBAC)";
# -EnableSoftDelete removido: soft delete siempre activo en versiones recientes del servicio.
$existingKv = Get-AzKeyVault -VaultName $KeyVaultName -ErrorAction SilentlyContinue
if(-not $existingKv){
  $kv = New-AzKeyVault -Name $KeyVaultName -ResourceGroupName $ResourceGroupName -Location $Location -Sku Standard -EnablePurgeProtection -EnableRbacAuthorization -Tag $Tags
} else {
  Write-Warn "Key Vault ya existe: se reutiliza."
  $kv = $existingKv
}

Write-Step "Creando Storage Account";
$storage = New-AzStorageAccount -Name $StorageAccountName -ResourceGroupName $ResourceGroupName -Location $Location -SkuName Standard_LRS -Kind StorageV2 -EnableHttpsTrafficOnly $true -MinimumTlsVersion TLS1_2 -AllowBlobPublicAccess:$false -Tag $Tags

Write-Step "Creando App Service Plan (Linux)";
New-AzAppServicePlan -Name $PlanName -ResourceGroupName $ResourceGroupName -Location $Location -Tier Basic -NumberofWorkers 1 -WorkerSize Small -Linux | Out-Null

Write-Step "Creando PostgreSQL Flexible Server (privado si DNS privado disponible)";
$subnetPg = Get-AzVirtualNetworkSubnetConfig -VirtualNetwork $vnet -Name $SubnetPostgresName
if($privateDnsSupported){
  New-AzPostgreSqlFlexibleServer -Name $PostgresServerName -ResourceGroupName $ResourceGroupName -Location $Location -SkuTier Burstable -SkuName Standard_B1ms -Version 16 -StorageSizeGb 32 -AdministratorUser $PostgresAdminUser -AdministratorPassword (ConvertTo-SecureString $PostgresAdminPassword -AsPlainText -Force) -DelegatedSubnetId $subnetPg.Id -PrivateDnsZoneName 'privatelink.postgres.database.azure.com' -BackupRetentionDay 7 -HighAvailability Disabled -Tag $Tags | Out-Null
} else {
  New-AzPostgreSqlFlexibleServer -Name $PostgresServerName -ResourceGroupName $ResourceGroupName -Location $Location -SkuTier Burstable -SkuName Standard_B1ms -Version 16 -StorageSizeGb 32 -AdministratorUser $PostgresAdminUser -AdministratorPassword (ConvertTo-SecureString $PostgresAdminPassword -AsPlainText -Force) -DelegatedSubnetId $subnetPg.Id -BackupRetentionDay 7 -HighAvailability Disabled -Tag $Tags -PublicAccess All | Out-Null
  Write-Warn "Servidor creado con acceso público temporal por falta de DNS privado. Se recomienda instalar módulo y recrear para privacidad completa."}

Write-Step "Creando Web App (Node 24 LTS)";
$webApp = New-AzWebApp -Name $WebAppName -ResourceGroupName $ResourceGroupName -Location $Location -AppServicePlan $PlanName -Runtime "node|24-lts"

Write-Step "Habilitando identidad administrada Web App";
Update-AzWebApp -Name $WebAppName -ResourceGroupName $ResourceGroupName -AssignIdentity | Out-Null
$webApp = Get-AzWebApp -Name $WebAppName -ResourceGroupName $ResourceGroupName

Write-Step "Integrando Web App con subnet App Service";
$subnetApp = Get-AzVirtualNetworkSubnetConfig -VirtualNetwork $vnet -Name $SubnetAppServiceName
New-AzWebAppVnetIntegration -WebAppName $WebAppName -ResourceGroupName $ResourceGroupName -SubnetId $subnetApp.Id | Out-Null

Write-Step "Creando secretos en Key Vault (DB-PASSWORD)";
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name 'DB-PASSWORD' -SecretValue (ConvertTo-SecureString $PostgresAdminPassword -AsPlainText -Force) | Out-Null
Set-AzKeyVaultSecret -VaultName $KeyVaultName -Name 'JWT-SECRET' -SecretValue (ConvertTo-SecureString ([Guid]::NewGuid().ToString('N')) -AsPlainText -Force) | Out-Null

Write-Step "Asignando roles a identidad Web App";
$principalId = $webApp.Identity.PrincipalId
New-AzRoleAssignment -ObjectId $principalId -RoleDefinitionName "Key Vault Secrets User" -Scope $kv.ResourceId | Out-Null
New-AzRoleAssignment -ObjectId $principalId -RoleDefinitionName "Storage Blob Data Reader" -Scope $storage.Id | Out-Null

Write-Step "Configurando App Settings con referencias a Key Vault";
$kvUri = $kv.VaultUri.TrimEnd('/')
$settings = @{
  PORT               = '8080'
  NODE_ENV           = 'production'
  DB_HOST            = "$($PostgresServerName).postgres.database.azure.com"
  DB_PORT            = '5432'
  DB_USER            = "pgadmin@$PostgresServerName"
  DB_NAME            = 'lama_db'
  KEY_VAULT_NAME     = $KeyVaultName
  DB_PASSWORD        = "@Microsoft.KeyVault(SecretUri=$kvUri/secrets/DB-PASSWORD)"
  JWT_SECRET         = "@Microsoft.KeyVault(SecretUri=$kvUri/secrets/JWT-SECRET)"
  APPINSIGHTS_CONNECTION_STRING = $insights.ConnectionString
}
Set-AzWebApp -Name $WebAppName -ResourceGroupName $ResourceGroupName -AppSettings $settings | Out-Null

Write-Step "Infraestructura creada. Resumen:";
Write-Info "WebApp URL: https://$WebAppName.azurewebsites.net"
Write-Info "PostgreSQL FQDN: $($PostgresServerName).postgres.database.azure.com"
Write-Info "Key Vault URI: $kvUri"
Write-Info "Insights ConnectionString: $($insights.ConnectionString)"
Write-Info "Log Analytics Workspace Id: $($law.ResourceId)"
