<#
.SYNOPSIS
Ejecuta migraciones de TypeORM en la WebApp de Azure mediante SSH.
.DESCRIPTION
Se conecta a la WebApp via SSH, ejecuta npm run migration:run y muestra el resultado.
Requiere que el proyecto tenga definido el script "migration:run" en package.json.
.PARAMETER WebAppName
Nombre de la WebApp (ej: lama-backend-dev).
.PARAMETER ResourceGroup
Resource group (ej: lama-dev-rg).
.EXAMPLE
./Run-Migrations-SSH.ps1 -WebAppName lama-backend-dev -ResourceGroup lama-dev-rg
.NOTES
Alternativa: ejecutar localmente con variables de entorno desde KeyVault.
#>
param(
    [Parameter(Mandatory=$true)][string]$WebAppName,
    [Parameter(Mandatory=$true)][string]$ResourceGroup
)

$ErrorActionPreference = 'Stop'

Write-Host "[*] Conectando a $WebAppName via SSH..." -ForegroundColor Cyan

# Comando remoto: ir a directorio del código, instalar deps si falta, correr migraciones
$sshCommand = @"
cd /home/site/wwwroot && \
npm install --production=false && \
npm run migration:run
"@

Write-Host "[*] Ejecutando comando: npm run migration:run" -ForegroundColor Yellow

try {
    az webapp ssh --name $WebAppName --resource-group $ResourceGroup --command $sshCommand
    Write-Host "[OK] Migraciones ejecutadas." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Falló ejecución: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[INFO] Alternativa: usar az webapp log tail para ver errores en vivo." -ForegroundColor Yellow
    exit 1
}
