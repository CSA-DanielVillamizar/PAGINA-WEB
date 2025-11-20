# Script para ejecutar migraciones en Azure WebApp
# Las credenciales se toman de App Settings (incluye Key Vault references)

Write-Host "🔄 Desplegando código con migración..." -ForegroundColor Cyan

# 1. Build local
Write-Host "`n📦 Building..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# 2. Desplegar a Azure
Write-Host "`n🚀 Deploying to Azure..." -ForegroundColor Yellow
az webapp deploy `
    --resource-group lama-dev-rg `
    --name lama-backend-dev `
    --src-path . `
    --type zip `
    --async false

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Esperando 10s para que el deploy termine..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 3. Ejecutar migración usando Kudu console (SSH over HTTP)
Write-Host "`n🔧 Running migration via Kudu..." -ForegroundColor Yellow

$publishProfile = az webapp deployment list-publishing-profiles `
    --resource-group lama-dev-rg `
    --name lama-backend-dev `
    --query "[?publishMethod=='MSDeploy'].{user:userName, pass:userPWD}" `
    | ConvertFrom-Json

$user = $publishProfile[0].user
$pass = $publishProfile[0].pass

$authHeader = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$user`:$pass"))

# Comando para ejecutar migración en el servidor
$body = @{
    command = "cd /home/site/wwwroot && npm run migrate"
    dir = "/home/site/wwwroot"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "https://lama-backend-dev.scm.azurewebsites.net/api/command" `
        -Method POST `
        -Headers @{
            "Authorization" = $authHeader
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -TimeoutSec 120

    Write-Host "`n✅ Migration Output:" -ForegroundColor Green
    Write-Host $response.Output
    Write-Host $response.Error -ForegroundColor Yellow

    if ($response.ExitCode -ne 0) {
        Write-Host "`n❌ Migration failed with exit code $($response.ExitCode)" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "`n❌ Failed to execute migration: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
