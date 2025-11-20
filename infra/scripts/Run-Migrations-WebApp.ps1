<#!
.SYNOPSIS
  Ejecuta migraciones en la Web App mediante la API de Kudu (scm) usando Publishing Credentials.
.DESCRIPTION
  Para evitar abrir SSH manual, se consume la API /api/command de Kudu y se ejecuta 'npm run migrate'.
  Requiere habilitar Publishing Credentials (por defecto) y tener rol suficiente para listar perfiles.
.PARAMETER ResourceGroupName
  RG donde reside la Web App.
.PARAMETER WebAppName
  Nombre de la Web App.
.PARAMETER Command
  Comando a ejecutar (default 'npm run migrate').
.EXAMPLE
  ./Run-Migrations-WebApp.ps1 -ResourceGroupName lama-dev-rg -WebAppName lama-backend-dev
#>
param(
  [Parameter(Mandatory=$true)][string]$ResourceGroupName,
  [Parameter(Mandatory=$true)][string]$WebAppName,
  [string]$Command = 'npm run migrate'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Err($m){ Write-Host "[ERROR] $m" -ForegroundColor Red }

Write-Info "Obteniendo publishing profile..."
$profiles = Get-AzWebAppPublishingProfile -Name $WebAppName -ResourceGroupName $ResourceGroupName -OutputFile temp_profile.xml
[xml]$xml = Get-Content temp_profile.xml
Remove-Item temp_profile.xml -Force
$profile = $xml.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'MSDeploy' }
if(-not $profile){ Write-Err "No se encontró perfil MSDeploy."; exit 1 }

$user = $profile.userName
$pass = $profile.userPWD
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$user`:$pass"))

$scmUrl = "https://$WebAppName.scm.azurewebsites.net/api/command"
Write-Info "Invocando comando en Kudu: $Command"
$body = @{ command = $Command; dir = 'site/wwwroot' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri $scmUrl -Method POST -Headers @{ Authorization = "Basic $auth"; Accept='application/json' } -ContentType 'application/json' -Body $body
Write-Info "Estado: $($response.exit_code)"
Write-Info "Salida:\n$($response.output)"
if($response.exit_code -ne 0){ Write-Err "Migraciones fallaron."; exit 1 }
Write-Info "Migraciones aplicadas correctamente."; 
