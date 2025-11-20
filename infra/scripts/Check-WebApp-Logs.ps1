# Script para revisar logs y diagnosticar problemas del WebApp
$WebAppName = "lama-backend-dev"
$ResourceGroup = "lama-dev-rg"

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DIAGNÓSTICO DE WEBAPP - $WebAppName" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# 1. Estado del WebApp
Write-Host "1️⃣ Estado del WebApp:" -ForegroundColor Yellow
$state = az webapp show --name $WebAppName --resource-group $ResourceGroup --query "{State:state, Enabled:enabled, AvailabilityState:availabilityState}" -o json 2>$null | ConvertFrom-Json
if ($state) {
    $state | Format-List
} else {
    Write-Host "   ⚠️ No se pudo obtener estado (verifica az login)" -ForegroundColor Red
}

# 2. Probar endpoint básico
Write-Host "`n2️⃣ Test de conectividad HTTP:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://$WebAppName.azurewebsites.net/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Responde: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Contenido: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   ❌ No responde: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Verificar App Settings críticos
Write-Host "`n3️⃣ App Settings críticos:" -ForegroundColor Yellow
$settings = az webapp config appsettings list --name $WebAppName --resource-group $ResourceGroup -o json 2>$null | ConvertFrom-Json
$critical = @('PORT', 'NODE_ENV', 'DB_HOST', 'DB_PASS', 'JWT_SECRET')
foreach ($key in $critical) {
    $setting = $settings | Where-Object { $_.name -eq $key }
    if ($setting) {
        $value = if ($setting.value.Length -gt 50) { $setting.value.Substring(0, 50) + "..." } else { $setting.value }
        Write-Host "   ✅ $key = $value" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $key = FALTA" -ForegroundColor Red
    }
}

# 4. Enlaces útiles
Write-Host "`n4️⃣ Enlaces de diagnóstico:" -ForegroundColor Yellow
Write-Host "   📊 Portal: https://portal.azure.com/#@95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae/resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$WebAppName/appServices" -ForegroundColor Cyan
Write-Host "   🔍 Kudu: https://$WebAppName.scm.azurewebsites.net" -ForegroundColor Cyan
Write-Host "   📝 Log Stream (Portal): Settings → Log stream" -ForegroundColor Cyan

# 5. Comandos útiles
Write-Host "`n5️⃣ Comandos útiles para ejecutar:" -ForegroundColor Yellow
Write-Host "   # Ver logs en tiempo real:" -ForegroundColor Gray
Write-Host "   az webapp log tail --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host "`n   # Reiniciar WebApp:" -ForegroundColor Gray
Write-Host "   az webapp restart --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host "`n   # Acceder por SSH:" -ForegroundColor Gray
Write-Host "   az webapp ssh --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White

Write-Host "`n✅ Diagnóstico completado.`n" -ForegroundColor Green
