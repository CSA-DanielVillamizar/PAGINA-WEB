<#!
.SYNOPSIS
  Elimina completamente un Resource Group de Azure con validaciones y espera de finalización.
.DESCRIPTION
  Script seguro que verifica existencia, pide confirmación (opcional), inicia la eliminación y espera hasta que el RG desaparece.
  Usa módulo Az. Requiere sesión previa (Connect-AzAccount) o contexto ya establecido.
.PARAMETER ResourceGroupName
  Nombre del Resource Group a eliminar.
.PARAMETER Force
  Omite confirmación interactiva.
.EXAMPLE
  ./Remove-Environment.ps1 -ResourceGroupName lama-dev-rg -Force
#>
param(
  [Parameter(Mandatory=$true)][string]$ResourceGroupName,
  [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($msg){ Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg){ Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Info "Validando existencia del Resource Group '$ResourceGroupName'..."
$rg = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if(-not $rg){
  Write-Warn "Resource Group no existe. Nada que eliminar."
  return
}

if(-not $Force){
  $confirm = Read-Host "¿Eliminar RG '$ResourceGroupName'? Esta acción es IRREVERSIBLE (sí/no)"
  if($confirm -ne 'sí' -and $confirm -ne 'si'){
    Write-Warn "Operación cancelada por el usuario."
    return
  }
}

Write-Info "Iniciando eliminación..."
Remove-AzResourceGroup -Name $ResourceGroupName -Force -ErrorAction Stop
Write-Info "Solicitud de eliminación enviada. Esperando a que desaparezca..."

for($i=0; $i -lt 60; $i++){
  Start-Sleep -Seconds 10
  $exists = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
  if(-not $exists){
    Write-Info "Resource Group eliminado correctamente."
    return
  }
  Write-Info "Aún existe, reintentando verificación ($($i+1)/60)..."
}

Write-Err "Timeout al esperar la eliminación. Verificar manualmente en Azure Portal."
exit 1
