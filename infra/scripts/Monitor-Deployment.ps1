# Monitor-Deployment.ps1
# Script para monitorear el despliegue en Azure después de GitHub Actions

param(
    [string]$WebAppName = "lama-backend-dev",
    [string]$ResourceGroup = "lama-dev-rg"
)

$ErrorActionPreference = 'Continue'

Write-Host "`n╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Monitor de Despliegue - Azure Web App          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Función para verificar el estado de la app
function Test-WebAppHealth {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# 1. Verificar estado de la Web App
Write-Host "📱 Estado de la Web App:" -ForegroundColor Yellow
try {
    $webApp = Get-AzWebApp -Name $WebAppName -ResourceGroupName $ResourceGroup -ErrorAction Stop
    Write-Host "   Nombre: $($webApp.Name)" -ForegroundColor White
    Write-Host "   Estado: $($webApp.State)" -ForegroundColor $(if($webApp.State -eq 'Running'){'Green'}else{'Red'})
    Write-Host "   URL: https://$($webApp.DefaultHostName)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Error obteniendo información de la Web App" -ForegroundColor Red
    exit 1
}

# 2. Ver logs recientes
Write-Host "`n📋 Logs recientes (últimas 20 líneas):" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
az webapp log tail --name $WebAppName --resource-group $ResourceGroup --only-show-errors 2>&1 | Select-Object -First 20

# 3. Verificar health endpoints
Write-Host "`n🏥 Verificando Health Endpoints:" -ForegroundColor Yellow
$baseUrl = "https://$($webApp.DefaultHostName)"

Write-Host "   Probando /health..." -ForegroundColor White
$healthOk = Test-WebAppHealth "$baseUrl/health"
if($healthOk) {
    Write-Host "   ✅ /health respondiendo correctamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ /health no responde (puede estar iniciando)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

Write-Host "   Probando /health/ready..." -ForegroundColor White
$readyOk = Test-WebAppHealth "$baseUrl/health/ready"
if($readyOk) {
    Write-Host "   ✅ /health/ready respondiendo correctamente (DB conectada)" -ForegroundColor Green
} else {
    Write-Host "   ❌ /health/ready no responde (verificar conexión DB)" -ForegroundColor Yellow
}

# 4. Verificar App Settings
Write-Host "`n⚙️  App Settings críticos:" -ForegroundColor Yellow
$settings = Get-AzWebApp -Name $WebAppName -ResourceGroupName $ResourceGroup | Select-Object -ExpandProperty SiteConfig | Select-Object -ExpandProperty AppSettings
$criticalSettings = @('DB_HOST', 'DB_NAME', 'KEY_VAULT_NAME', 'NODE_ENV')
foreach($setting in $criticalSettings) {
    $value = $settings | Where-Object { $_.Name -eq $setting } | Select-Object -ExpandProperty Value
    if($value) {
        Write-Host "   ✅ $setting = $value" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $setting no configurado" -ForegroundColor Red
    }
}

# 5. Verificar conexión a PostgreSQL
Write-Host "`n🗄️  PostgreSQL:" -ForegroundColor Yellow
try {
    $pgServer = Get-AzPostgreSqlFlexibleServer -ResourceGroupName $ResourceGroup -Name "lama-pg-dev" -ErrorAction Stop
    Write-Host "   Estado: $($pgServer.State)" -ForegroundColor $(if($pgServer.State -eq 'Ready'){'Green'}else{'Yellow'})
    Write-Host "   FQDN: $($pgServer.FullyQualifiedDomainName)" -ForegroundColor White
} catch {
    Write-Host "   ⚠️  No se pudo obtener info del servidor PostgreSQL" -ForegroundColor Yellow
}

# 6. Resumen final
Write-Host "`n╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Resumen de Verificación                         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if($healthOk -and $readyOk) {
    Write-Host "✅ Aplicación funcionando correctamente" -ForegroundColor Green
    Write-Host "   • Health check: OK" -ForegroundColor White
    Write-Host "   • Database: Conectada" -ForegroundColor White
    Write-Host "   • Ready para producción`n" -ForegroundColor White
} elseif($healthOk) {
    Write-Host "⚠️  Aplicación parcialmente funcional" -ForegroundColor Yellow
    Write-Host "   • Health check: OK" -ForegroundColor White
    Write-Host "   • Database: Revisar conexión" -ForegroundColor Yellow
    Write-Host "   • Verificar logs para más detalles`n" -ForegroundColor White
} else {
    Write-Host "❌ Aplicación no responde" -ForegroundColor Red
    Write-Host "   • Verificar que GitHub Actions haya completado" -ForegroundColor White
    Write-Host "   • Revisar logs: az webapp log tail --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
    Write-Host "   • Esperar ~30 segundos para que la app inicie`n" -ForegroundColor White
}

Write-Host "🔗 Enlaces útiles:" -ForegroundColor Cyan
Write-Host "   Portal Azure: https://portal.azure.com" -ForegroundColor White
Write-Host "   Kudu Console: https://$WebAppName.scm.azurewebsites.net/" -ForegroundColor White
Write-Host "   GitHub Actions: https://github.com/CSA-DanielVillamizar/PAGINA-WEB/actions" -ForegroundColor White
Write-Host ""
