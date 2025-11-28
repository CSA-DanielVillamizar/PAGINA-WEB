# Script de Deployment Manual del Frontend Next.js
# Usar si Azure CLI falla

param(
    [string]$ZipPath = "deploy-frontend-final.zip",
    [string]$WebAppName = "lama-frontend-dev",
    [string]$ResourceGroup = "lama-dev-rg"
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   LAMA Foundation - Frontend Deployment Manual Helper     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar archivo ZIP
if (-not (Test-Path $ZipPath)) {
    Write-Host "❌ ERROR: No se encuentra $ZipPath" -ForegroundColor Red
    Write-Host "   Ubicación esperada: $(Resolve-Path .)\$ZipPath" -ForegroundColor Yellow
    exit 1
}

$zipSize = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
Write-Host "✓ ZIP encontrado: $ZipPath ($zipSize MB)" -ForegroundColor Green
Write-Host ""

# Mostrar opciones
Write-Host "═══════════════════ OPCIONES DE DEPLOYMENT ═══════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. KUDU CONSOLE (Recomendado - Más rápido)" -ForegroundColor Cyan
Write-Host "   - Ir a: https://portal.azure.com"
Write-Host "   - Buscar: $WebAppName"
Write-Host "   - Menú lateral → Advanced Tools → Go"
Write-Host "   - Tools → Zip Push Deploy"
Write-Host "   - Arrastrar: $(Resolve-Path $ZipPath)"
Write-Host ""

Write-Host "2. FTP DEPLOYMENT" -ForegroundColor Cyan
Write-Host "   Obteniendo credenciales FTP..." -ForegroundColor Yellow
try {
    $publishProfile = az webapp deployment list-publishing-profiles `
        --name $WebAppName `
        --resource-group $ResourceGroup `
        --query "[?publishMethod=='FTP']" `
        -o json 2>$null | ConvertFrom-Json
    
    if ($publishProfile) {
        Write-Host "   Host: $($publishProfile[0].publishUrl)" -ForegroundColor White
        Write-Host "   Usuario: $($publishProfile[0].userName)" -ForegroundColor White
        Write-Host "   Directorio: /site/wwwroot" -ForegroundColor White
        Write-Host ""
        Write-Host "   ⚠️  Password: Usar 'az webapp deployment list-publishing-credentials'" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  No se pudieron obtener credenciales automáticamente" -ForegroundColor Yellow
    Write-Host "   Obtener desde Portal: $WebAppName → Deployment Center → FTP Credentials" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "3. POWERSHELL DIRECTO (Experimental)" -ForegroundColor Cyan
Write-Host "   Presiona ENTER para intentar deployment vía PowerShell..." -ForegroundColor Yellow
Write-Host "   (o Ctrl+C para cancelar y usar método manual)" -ForegroundColor Gray
Write-Host ""

Read-Host "Presiona ENTER para continuar"

Write-Host ""
Write-Host "Intentando deployment vía Kudu API..." -ForegroundColor Cyan

try {
    # Obtener credenciales
    $credsJson = az webapp deployment list-publishing-credentials `
        --name $WebAppName `
        --resource-group $ResourceGroup `
        --query "{user:publishingUserName, pass:publishingPassword}" `
        -o json 2>$null
    
    if (-not $credsJson) {
        throw "No se pudieron obtener credenciales"
    }
    
    $creds = $credsJson | ConvertFrom-Json
    $base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($creds.user):$($creds.pass)"))
    
    Write-Host "✓ Credenciales obtenidas" -ForegroundColor Green
    
    # Subir archivo
    $kuduUrl = "https://$WebAppName.scm.azurewebsites.net/api/zipdeploy"
    $headers = @{
        Authorization = "Basic $base64Auth"
    }
    
    Write-Host "Subiendo archivo a Kudu..." -ForegroundColor Yellow
    Write-Host "(Esto puede tomar 1-2 minutos...)" -ForegroundColor Gray
    
    $fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $ZipPath))
    
    $response = Invoke-RestMethod -Uri $kuduUrl `
        -Method POST `
        -Headers $headers `
        -Body $fileBytes `
        -ContentType "application/zip" `
        -TimeoutSec 300
    
    Write-Host ""
    Write-Host "✅ DEPLOYMENT EXITOSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Esperando 10 segundos para que Azure reinicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "Verificando sitio..." -ForegroundColor Cyan
    $siteResponse = Invoke-WebRequest -Uri "https://$WebAppName.azurewebsites.net" -TimeoutSec 20 -UseBasicParsing
    Write-Host "✓ Sitio responde: $($siteResponse.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL: https://$WebAppName.azurewebsites.net" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Deployment automático falló: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor usar OPCIÓN 1 (Kudu Console) manualmente:" -ForegroundColor Yellow
    Write-Host "1. Ir a: https://$WebAppName.scm.azurewebsites.net" -ForegroundColor White
    Write-Host "2. Tools → Zip Push Deploy" -ForegroundColor White
    Write-Host "3. Arrastrar: $(Resolve-Path $ZipPath)" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Para verificar logs:" -ForegroundColor Yellow
Write-Host "  az webapp log tail --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host ""
Write-Host "Kudu Console directo:" -ForegroundColor Yellow
Write-Host "  https://$WebAppName.scm.azurewebsites.net/DebugConsole" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
