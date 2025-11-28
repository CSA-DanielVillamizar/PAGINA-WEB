<#!
.SYNOPSIS
Configura una Azure WebApp para modo diagnóstico sin base de datos, ajusta CORS y secretos.
.DESCRIPTION
Establece app settings: DISABLE_DB=1, FRONTEND_URL, DB_PASS (KeyVault reference) y WEBSITE_HEALTHCHECK_URL.
Validará existencia de la WebApp y mostrará resultado final. No ejecuta migraciones.
.PARAMETER WebAppName
Nombre de la WebApp (ej: lama-backend-dev).
.PARAMETER ResourceGroup
Nombre del resource group (ej: lama-dev-rg).
.PARAMETER FrontendUrl
URL del frontend (ej: https://app.fundacionlamamedellin.org).
.PARAMETER DbPassSecretUri
URI del secreto en Key Vault para la contraseña de la DB (opcional). Si vacío, no modifica DB_PASS.
.EXAMPLE
./Configure-WebApp-NoDB.ps1 -WebAppName lama-backend-dev -ResourceGroup lama-dev-rg -FrontendUrl https://app.fundacionlamamedellin.org -DbPassSecretUri https://kv.vault.azure.net/secrets/DB-PASSWORD/<version>
.NOTES
Requiere Azure CLI instalado y sesión activa (az login). Si tu CLI local está roto, usa Azure Cloud Shell.
#>
param(
    [Parameter(Mandatory=$true)][string]$WebAppName,
    [Parameter(Mandatory=$true)][string]$ResourceGroup,
    [Parameter(Mandatory=$true)][string]$FrontendUrl,
    [Parameter(Mandatory=$false)][string]$DbPassSecretUri
)

$ErrorActionPreference = 'Stop'

function Assert-AzCli() {
    Write-Host '[*] Verificando Azure CLI...' -ForegroundColor Cyan
    try {
        az --version | Out-Null
    } catch {
        throw 'Azure CLI no disponible. Instala desde: https://learn.microsoft.com/cli/azure/install-azure-cli'
    }
}

function Assert-Login() {
    Write-Host '[*] Verificando sesión (az account show)...' -ForegroundColor Cyan
    try {
        $acct = az account show --only-show-errors 2>$null | ConvertFrom-Json
        if (-not $acct) { throw 'Sesión no encontrada' }
        Write-Host "[OK] Subcripción: $($acct.name) / $($acct.id)" -ForegroundColor Green
    } catch {
        Write-Host '[!] No hay sesión activa. Ejecuta: az login' -ForegroundColor Yellow
        throw 'Sin login'
    }
}

function Get-WebApp() {
    Write-Host "[*] Buscando WebApp '$WebAppName' en RG '$ResourceGroup'..." -ForegroundColor Cyan
    $webappJson = az webapp show --name $WebAppName --resource-group $ResourceGroup --only-show-errors 2>$null | ConvertFrom-Json
    if (-not $webappJson) { throw "WebApp '$WebAppName' no encontrada en '$ResourceGroup'" }
    Write-Host "[OK] WebApp encontrada. Kind: $($webappJson.kind) LinuxFx: $($webappJson.siteConfig.linuxFxVersion)" -ForegroundColor Green
    return $webappJson
}

function Set-AppSettings() {
    Write-Host '[*] Aplicando app settings (modo sin DB + CORS + healthcheck)...' -ForegroundColor Cyan
    $settings = @{
        DISABLE_DB = '1'
        FRONTEND_URL = $FrontendUrl
        WEBSITE_HEALTHCHECK_URL = '/health'
    }
    if ($DbPassSecretUri) {
        $settings.DB_PASS = "@Microsoft.KeyVault(SecretUri=$DbPassSecretUri)"
    }
    # Construir argumentos "key=value"
    $kvPairs = $settings.GetEnumerator() | ForEach-Object { "{0}={1}" -f $_.Key, $_.Value }
    az webapp config appsettings set --name $WebAppName --resource-group $ResourceGroup --settings $kvPairs --only-show-errors | Out-Null
    Write-Host '[OK] App settings aplicados.' -ForegroundColor Green
}

function Show-Result() {
    Write-Host '[*] Leyendo configuración final...' -ForegroundColor Cyan
    $apps = az webapp config appsettings list --name $WebAppName --resource-group $ResourceGroup --only-show-errors | ConvertFrom-Json
    $filter = $apps | Where-Object { $_.name -in @('DISABLE_DB','FRONTEND_URL','DB_PASS','WEBSITE_HEALTHCHECK_URL','PORT','NODE_ENV') }
    $filter | Format-Table name, value -AutoSize
}

function Restart-WebApp() {
    Write-Host '[*] Reiniciando WebApp...' -ForegroundColor Cyan
    az webapp restart --name $WebAppName --resource-group $ResourceGroup --only-show-errors | Out-Null
    Write-Host '[OK] Reinicio solicitado.' -ForegroundColor Green
    Write-Host '[*] Esperando 30s antes de probar /health...' -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    Try-Health
}

function Try-Health() {
    $healthUrl = "https://$WebAppName.azurewebsites.net/health"
    Write-Host "[*] Probando $healthUrl" -ForegroundColor Cyan
    try {
        $resp = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 10
        Write-Host "[OK] HEALTH: $(ConvertTo-Json $resp)" -ForegroundColor Green
    } catch {
        Write-Host "[!] Error al invocar /health: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host '[!] Verifica logs en Portal (Log Stream) o az webapp log tail.' -ForegroundColor Yellow
    }
}

try {
    Assert-AzCli
    Assert-Login
    Get-WebApp | Out-Null
    Set-AppSettings
    Show-Result
    Restart-WebApp
    Write-Host '[FIN] Modo sin DB aplicado. Si /health funciona, luego vuelve a DISABLE_DB=0 y configura DB_PASS correcto.' -ForegroundColor Magenta
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
