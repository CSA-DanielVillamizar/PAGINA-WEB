<#
.SYNOPSIS
    Verifica el estado post-despliegue del backend en Azure App Service.
.DESCRIPTION
    Realiza chequeos de salud (health / readiness), lista App Settings, valida que las
    referencias de Key Vault estén presentes, y genera un resumen final. No requiere credenciales
    de base de datos; opcionalmente puede probar conectividad TCP al servidor PostgreSQL.
.NOTAS
    - Usa únicamente endpoints públicos y az cli.
    - Asegúrate de haber ejecutado 'az login' antes si no hay sesión activa.
#>
[CmdletBinding()]
param(
    [string]$ResourceGroup = 'lama-dev-rg',
    [string]$WebAppName    = 'lama-backend-dev',
    [string]$HealthPath    = '/health',
    [string]$ReadyPath     = '/health/ready',
    [string]$PostgresHost  = 'lama-pg-dev.postgres.database.azure.com',
    [int]$PostgresPort     = 5432,
    [switch]$SkipPostgresConnectivity
)

function Invoke-HttpCheck {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 10
    )
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $TimeoutSeconds -UseBasicParsing
        [pscustomobject]@{ Url = $Url; StatusCode = $response.StatusCode; Length = $response.Content.Length; Success = $true }
    }
    catch {
        [pscustomobject]@{ Url = $Url; StatusCode = $null; Length = 0; Success = $false; Error = $_.Exception.Message }
    }
}

function Get-AppSettings {
    param(
        [string]$Name,
        [string]$Rg
    )
    $settings = az webapp config appsettings list --name $Name --resource-group $Rg --output json 2>$null | ConvertFrom-Json
    $settings | Sort-Object name
}

function Test-PostgresPort {
    param(
        [string]$DbHost,
        [int]$DbPort
    )
    try {
        $tcp = Test-NetConnection -ComputerName $DbHost -Port $DbPort -WarningAction SilentlyContinue
        [pscustomobject]@{ Server = $DbHost; Port = $DbPort; TcpSuccess = $tcp.TcpTestSucceeded }
    }
    catch {
        [pscustomobject]@{ Server = $DbHost; Port = $DbPort; TcpSuccess = $false; Error = $_.Exception.Message }
    }
}

Write-Host "\n==== VERIFICACION DEPLOY BACKEND ====" -ForegroundColor Cyan
Write-Host "WebApp: $WebAppName (RG: $ResourceGroup)" -ForegroundColor Cyan

# 1. Estado del WebApp
$webapp = az webapp show --name $WebAppName --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json
if (-not $webapp) { Write-Warning "No se pudo obtener el WebApp. ¿Sesion az login?"; return }
Write-Host "Estado: $($webapp.state)  | URL: https://$($webapp.defaultHostName)" -ForegroundColor Green

# 2. Health checks
$baseUrl = "https://$($webapp.defaultHostName)"
$health   = Invoke-HttpCheck -Url ($baseUrl + $HealthPath)
$ready    = Invoke-HttpCheck -Url ($baseUrl + $ReadyPath)

Write-Host "\n-- Health Checks --" -ForegroundColor Yellow
$health | Format-Table Url, StatusCode, Success
$ready  | Format-Table Url, StatusCode, Success

# 3. App Settings
Write-Host "\n-- App Settings --" -ForegroundColor Yellow
$appSettings = Get-AppSettings -Name $WebAppName -Rg $ResourceGroup
$appSettings | Select-Object name,value | Format-Table -AutoSize

# 4. Validar referencias Key Vault
$kvReferenced = $appSettings | Where-Object { $_.value -like '@Microsoft.KeyVault*' }
Write-Host "\nReferencias Key Vault encontradas: $($kvReferenced.Count)" -ForegroundColor Green
$kvReferenced | Select-Object name,value | Format-Table -AutoSize

# 5. Conectividad PostgreSQL (opcional)
if (-not $SkipPostgresConnectivity) {
    Write-Host "\n-- Conectividad PostgreSQL (TCP) --" -ForegroundColor Yellow
    $pg = Test-PostgresPort -DbHost $PostgresHost -DbPort $PostgresPort
    $pg | Format-Table Server,Port,TcpSuccess
}

# 6. Resumen
$summary = [pscustomobject]@{
    WebAppState      = $webapp.state
    HealthOk         = $health.Success
    ReadyOk          = $ready.Success
    KeyVaultRefs     = $kvReferenced.Count
    PostgresTcpOk    = if ($SkipPostgresConnectivity) { $null } else { $pg.TcpSuccess }
}

Write-Host "\n==== RESUMEN ====" -ForegroundColor Cyan
$summary | Format-List

Write-Host "\nSiguientes pasos sugeridos:" -ForegroundColor Magenta
Write-Host "  - Revisar logs si HealthOk o ReadyOk = False: az webapp log tail --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host "  - Ejecutar migraciones si readiness falla por DB: az webapp ssh --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host "  - Dentro del SSH: cd /home/site/wwwroot; npm run migrate" -ForegroundColor White
Write-Host "  - Consultar Application Insights para errores recientes." -ForegroundColor White

Write-Host "\nVerificación completada." -ForegroundColor Green
