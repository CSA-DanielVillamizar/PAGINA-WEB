<#
  Despliegue automatizado del backend a Azure App Service usando Local Git.
  Requisitos:
    - Azure CLI instalado y autenticado (az login) o ejecutar en Cloud Shell.
    - Recurso App Service existente con Basic Auth habilitado.
    - App Settings ya configurados (DB_*, PORT, NODE_ENV, WEBSITE_STARTUP_FILE, SCM_DO_BUILD_DURING_DEPLOYMENT=true, etc.).
    - Rama principal 'main' preparada sin node_modules.

  Uso rápido:
    .\deploy-local-git.ps1 -AppName lama-dev-backend -ResourceGroup rg-lama-dev -AutoConfirm

  Parámetros:
    -AppName              Nombre del WebApp.
    -ResourceGroup        Grupo de recursos.
    -ResetPublishingProfile  Opcional: regenerar credenciales antes de desplegar.
    -SkipPush             Sólo actualizar remote y mostrar credenciales.
    -TailLogs             Tras el push, inicia tail de logs.
    -AutoConfirm          No pedir confirmaciones interactivas.

  Seguridad:
    Este script puede embedir credenciales en la URL del remote para simplificar.
    Eso deja la contraseña en el historial Git (config) si no se elimina el remote luego.
    Alternativa: usar credential manager interactivo (quitar EmbedCreds).

  Pasos:
    1. Obtener credenciales de publicación (app-scope).
    2. (Opcional) Reset publishing profile.
    3. Preparar remote limpio.
    4. (Opcional) Push de la rama 'main' con credenciales embebidas.
    5. Verificar build y health.
#>
param(
  [string]$AppName = 'lama-dev-backend',
  [string]$ResourceGroup = 'rg-lama-dev',
  [switch]$ResetPublishingProfile,
  [switch]$SkipPush,
  [switch]$TailLogs,
  [switch]$AutoConfirm,
  [switch]$EmbedCreds = $true
)

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Confirm-Step($message) {
  if ($AutoConfirm) { return $true }
  $r = Read-Host "$message (y/N)"
  return ($r -match '^(y|yes)$')
}

function Assert-AzCli() {
  if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Err 'Azure CLI (az) no encontrado en PATH.'
    throw 'Instala Azure CLI o usa Cloud Shell.'
  }
}

function Get-PublishingCredentials() {
  Write-Info "Obteniendo credenciales de publicación para $AppName"
  $json = az webapp deployment list-publishing-credentials -g $ResourceGroup -n $AppName --output json 2>$null
  if (-not $json) { throw "No se pudieron obtener credenciales (verifica RG/AppName)." }
  $obj = $json | ConvertFrom-Json
  [PSCustomObject]@{
    User = $obj.publishingUserName
    Pass = $obj.publishingPassword
    ScmUri = $obj.scmUri
  }
}

function Reset-PublishingProfile() {
  Write-Warn 'Reseteando publishing profile (rotará la contraseña).'
  az webapp deployment reset-publishing-profile -g $ResourceGroup -n $AppName 1>$null
  Start-Sleep -Seconds 4
}

function Ensure-GitRepo() {
  if (-not (Test-Path .git)) {
    Write-Info 'Inicializando repositorio Git (branch main)'
    git init --initial-branch=main | Out-Null
    git add .
    git commit -m 'Inicialización para despliegue Azure' | Out-Null
  }
}

function Ensure-PackageJson() {
  if (-not (Test-Path package.json)) { throw 'package.json no está en el directorio actual. Debe estar en la raíz del backend.' }
}

function Remove-RemoteIfExists($name) {
  $remotes = git remote 2>$null
  if ($remotes -and ($remotes -contains $name)) {
    Write-Info "Eliminando remote existente '$name'"
    git remote remove $name
  }
}

function Add-AzureRemote($creds) {
  $baseUrl = "https://$AppName.scm.azurewebsites.net:443/$AppName.git"
  if ($EmbedCreds) {
    Write-Warn 'Embebiendo credenciales en URL (menos seguro).'
    $safePass = $creds.Pass
    $url = "https://$($creds.User):$safePass@$AppName.scm.azurewebsites.net:443/$AppName.git"
  } else {
    Write-Info 'Añadiendo remote sin credenciales (pedirá autenticación en push).'
    $url = $baseUrl
  }
  Write-Info "Agregando remote 'azure' -> $baseUrl"
  git remote add azure $url
}

function Push-Main() {
  Write-Info 'Realizando push a azure (rama main)'
  git push azure main
}

function Check-Health() {
  $healthUrl = "https://$AppName.azurewebsites.net/health"
  Write-Info "Verificando health: $healthUrl"
  try {
    $resp = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
    Write-Host "[HEALTH] $(ConvertTo-Json $resp)" -ForegroundColor Green
  } catch {
    Write-Err "Health endpoint no responde: $($_.Exception.Message)"
  }
}

function Tail-Logs() {
  Write-Info 'Iniciando tail de logs (Ctrl+C para salir)'
  az webapp log tail -g $ResourceGroup -n $AppName
}

# --- Ejecución principal ---
Write-Info "Inicio despliegue Local Git -> AppService ($AppName)"
Assert-AzCli
Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)
Ensure-PackageJson
Ensure-GitRepo

if ($ResetPublishingProfile) {
  if (Confirm-Step '¿Resetear publishing profile?') { Reset-PublishingProfile } else { Write-Warn 'Saltando reset publishing profile.' }
}

$creds = Get-PublishingCredentials
Write-Info "Credenciales obtenidas: user=$($creds.User) pass_length=$($creds.Pass.Length)"
if (-not $creds.Pass) { Write-Warn 'Password vacío. Verifica que Basic Auth esté habilitado en el portal.' }

Remove-RemoteIfExists 'azure'
Add-AzureRemote $creds

if ($SkipPush) {
  Write-Warn 'SkipPush activo. No se hará push.'
} else {
  if (Confirm-Step '¿Ejecutar push ahora?') { Push-Main } else { Write-Warn 'Push omitido por el usuario.' }
}

Write-Info 'Chequeo de health tras despliegue (puede tardar unos segundos en arrancar).'
Start-Sleep -Seconds 8
Check-Health

if ($TailLogs) {
  Tail-Logs
}

Write-Info 'Proceso completado.'
Write-Warn 'Si embebiste credenciales considera: git remote remove azure && volver a agregar sin password.'
