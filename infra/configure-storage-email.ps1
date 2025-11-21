<#
.SYNOPSIS
  Script de configuración para Azure Blob Storage y Azure Communication Services (Email) en App Service.
.DESCRIPTION
  - Obtiene connection string de Storage si no se provee.
  - Crea secretos en Key Vault (storage-conn, acs-email-conn).
  - Configura App Settings con referencias a Key Vault.
.PARAMETER ResourceGroup
  Nombre del Resource Group.
.PARAMETER KeyVaultName
  Nombre del Key Vault existente con identidad habilitada para App Service.
.PARAMETER AppServiceName
  Nombre del Azure Web App (backend).
.PARAMETER StorageAccountName
  Nombre de la cuenta de Storage.
.PARAMETER CommunicationConnectionString
  Connection string de Azure Communication Services (endpoint=...;accesskey=...).
.PARAMETER EmailSender
  Dirección remitente validada.
.PARAMETER RequireBlob
  true/false para FEATURE_BLOB_REQUIRED.
.PARAMETER RequireEmail
  true/false para FEATURE_EMAIL_REQUIRED.
.EXAMPLE
  ./configure-storage-email.ps1 -ResourceGroup lama-foundation-rg -KeyVaultName lama-kv-foundation -AppServiceName lama-backend-dev -StorageAccountName lamastoragecus -CommunicationConnectionString "endpoint=https://xxx.communication.azure.com/;accesskey=YYY" -EmailSender "no-reply@fundacionlama.org" -RequireBlob true -RequireEmail false
#>
param(
  [Parameter(Mandatory=$true)][string]$ResourceGroup,
  [Parameter(Mandatory=$true)][string]$KeyVaultName,
  [Parameter(Mandatory=$true)][string]$AppServiceName,
  [Parameter(Mandatory=$true)][string]$StorageAccountName,
  [Parameter(Mandatory=$true)][string]$CommunicationConnectionString,
  [Parameter(Mandatory=$true)][string]$EmailSender,
  [Parameter(Mandatory=$false)][bool]$RequireBlob = $true,
  [Parameter(Mandatory=$false)][bool]$RequireEmail = $false
)

Write-Host "[INFO] Validando sesión Azure..." -ForegroundColor Cyan
az account show 1>$null 2>$null
if ($LASTEXITCODE -ne 0) { Write-Error "No hay sesión de Azure. Ejecuta 'az login'"; exit 1 }

Write-Host "[INFO] Obteniendo connection string de Storage..." -ForegroundColor Cyan
$storageConn = az storage account show-connection-string -g $ResourceGroup -n $StorageAccountName --query connectionString -o tsv
if (-not $storageConn) { Write-Error "No se pudo obtener connection string de Storage."; exit 1 }

Write-Host "[INFO] Creando/actualizando secretos en Key Vault..." -ForegroundColor Cyan
az keyvault secret set --vault-name $KeyVaultName --name storage-conn --value $storageConn 1>$null
az keyvault secret set --vault-name $KeyVaultName --name acs-email-conn --value $CommunicationConnectionString 1>$null
az keyvault secret set --vault-name $KeyVaultName --name email-sender --value $EmailSender 1>$null

Write-Host "[INFO] Obteniendo URIs de versión de secretos..." -ForegroundColor Cyan
$storageSecretUri = az keyvault secret show --vault-name $KeyVaultName --name storage-conn --query id -o tsv
$acsSecretUri = az keyvault secret show --vault-name $KeyVaultName --name acs-email-conn --query id -o tsv
$emailSenderUri = az keyvault secret show --vault-name $KeyVaultName --name email-sender --query id -o tsv

Write-Host "[INFO] Configurando App Settings con referencias a Key Vault..." -ForegroundColor Cyan
az webapp config appsettings set -g $ResourceGroup -n $AppServiceName --settings `
  AZURE_STORAGE_CONNECTION_STRING=@Microsoft.KeyVault(SecretUri=$storageSecretUri) `
  AZURE_COMMUNICATION_CONNECTION_STRING=@Microsoft.KeyVault(SecretUri=$acsSecretUri) `
  EMAIL_SENDER_ADDRESS=@Microsoft.KeyVault(SecretUri=$emailSenderUri) `
  FEATURE_BLOB_REQUIRED=$RequireBlob `
  FEATURE_EMAIL_REQUIRED=$RequireEmail 1>$null

Write-Host "[SUCCESS] Configuración aplicada. Reinicia el Web App para que tome los cambios." -ForegroundColor Green
Write-Host "          Prueba: /api/diagnostics/blob?testUpload=true y /api/diagnostics/email?to=correo@dominio" -ForegroundColor Green
