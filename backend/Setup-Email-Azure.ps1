<#
.SYNOPSIS
  Configura App Settings de Azure App Service para SMTP (Office 365).
  
.DESCRIPTION
  Crea o actualiza App Settings en un Azure Web App con la configuración SMTP.
  Opcionalmente almacena secretos en Key Vault y referencia desde App Settings.
  
.PARAMETER ResourceGroup
  Nombre del Resource Group de Azure.
  
.PARAMETER AppServiceName
  Nombre del Azure Web App (backend).
  
.PARAMETER SmtpPass
  Contraseña del buzón SMTP.
  
.PARAMETER KeyVaultName
  (Opcional) Nombre del Key Vault para almacenar secretos.
  Si se provee, crea secret smtp-pass y referencia desde App Setting.
  
.EXAMPLE
  # Configuración directa (secreto en App Settings)
  .\Setup-Email-Azure.ps1 -ResourceGroup lama-foundation-rg -AppServiceName lama-backend-prod -SmtpPass "MiPass123"
  
.EXAMPLE
  # Configuración con Key Vault (recomendado producción)
  .\Setup-Email-Azure.ps1 -ResourceGroup lama-foundation-rg -AppServiceName lama-backend-prod -SmtpPass "MiPass123" -KeyVaultName lama-kv-prod
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$ResourceGroup,
  
  [Parameter(Mandatory=$true)]
  [string]$AppServiceName,
  
  [Parameter(Mandatory=$true)]
  [string]$SmtpPass,
  
  [Parameter(Mandatory=$false)]
  [string]$KeyVaultName = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Configurando SMTP en Azure App Service " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Validar sesión Azure
Write-Host "[INFO] Validando sesión Azure..." -ForegroundColor Cyan
az account show 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Error "No hay sesión de Azure activa. Ejecuta 'az login'"
  exit 1
}

$account = az account show --query "{Subscription:name, User:user.name}" -o json | ConvertFrom-Json
Write-Host "[✓] Sesión activa: $($account.User) - $($account.Subscription)" -ForegroundColor Green

# Si hay Key Vault, almacenar secreto allí
$smtpPassValue = $SmtpPass
if ($KeyVaultName) {
  Write-Host "[INFO] Almacenando secreto en Key Vault: $KeyVaultName" -ForegroundColor Cyan
  
  az keyvault secret set `
    --vault-name $KeyVaultName `
    --name smtp-pass `
    --value $SmtpPass `
    --output none
  
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Error almacenando secreto en Key Vault. Verifica permisos."
    exit 1
  }
  
  $secretUri = az keyvault secret show `
    --vault-name $KeyVaultName `
    --name smtp-pass `
    --query id `
    -o tsv
  
  $smtpPassValue = "@Microsoft.KeyVault(SecretUri=$secretUri)"
  Write-Host "[✓] Secreto almacenado en Key Vault" -ForegroundColor Green
  Write-Host "    URI: $secretUri" -ForegroundColor Gray
}

# Configurar App Settings
Write-Host "[INFO] Configurando App Settings en: $AppServiceName" -ForegroundColor Cyan

az webapp config appsettings set `
  -g $ResourceGroup `
  -n $AppServiceName `
  --settings `
    SMTP_HOST=smtp.office365.com `
    SMTP_PORT=587 `
    SMTP_SECURE=false `
    SMTP_USER=gerencia@fundacionlamamedellin.org `
    SMTP_PASS="$smtpPassValue" `
    SMTP_FROM=gerencia@fundacionlamamedellin.org `
    INSCRIPTIONS_RECEIVER=gerencia@fundacionlamamedellin.org `
    FEATURE_EMAIL_REQUIRED=false `
  --output none

if ($LASTEXITCODE -ne 0) {
  Write-Error "Error configurando App Settings."
  exit 1
}

Write-Host "[✓] App Settings configurados correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Configuración aplicada:" -ForegroundColor Yellow
Write-Host "  SMTP_HOST: smtp.office365.com" -ForegroundColor White
Write-Host "  SMTP_PORT: 587" -ForegroundColor White
Write-Host "  SMTP_USER: gerencia@fundacionlamamedellin.org" -ForegroundColor White
Write-Host "  INSCRIPTIONS_RECEIVER: gerencia@fundacionlamamedellin.org" -ForegroundColor White
if ($KeyVaultName) {
  Write-Host "  SMTP_PASS: @Microsoft.KeyVault(...)" -ForegroundColor White
}
Write-Host ""
Write-Host "Reinicia el Web App para que tome los cambios:" -ForegroundColor Yellow
Write-Host "  az webapp restart -g $ResourceGroup -n $AppServiceName" -ForegroundColor White
Write-Host ""
Write-Host "Prueba el endpoint de diagnóstico:" -ForegroundColor Yellow
Write-Host "  curl https://$AppServiceName.azurewebsites.net/api/diagnostics/email?to=tucorreo@ejemplo.com" -ForegroundColor White
