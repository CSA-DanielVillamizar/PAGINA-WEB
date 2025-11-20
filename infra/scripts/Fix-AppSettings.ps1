# Script para reconfigurar App Settings del WebApp
$WebAppName = "lama-backend-dev"
$ResourceGroup = "lama-dev-rg"
$KeyVaultName = "lama-kv-dev99"

Write-Host "Reconfigurando App Settings..." -ForegroundColor Yellow

az webapp config appsettings set `
  --name $WebAppName `
  --resource-group $ResourceGroup `
  --settings `
    PORT="8080" `
    NODE_ENV="production" `
    DB_HOST="lama-pg-dev.postgres.database.azure.com" `
    DB_PORT="5432" `
    DB_USER="pgadmin@lama-pg-dev" `
    DB_NAME="lama_db" `
    DB_PASS="@Microsoft.KeyVault(SecretUri=https://$KeyVaultName.vault.azure.net/secrets/DB-PASSWORD)" `
    JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://$KeyVaultName.vault.azure.net/secrets/JWT-SECRET)" `
    KEY_VAULT_NAME="$KeyVaultName" `
    APPINSIGHTS_INSTRUMENTATIONKEY="43d31ff7-79b9-4a57-9616-40740b25b778"

Write-Host "App Settings configurados. Reiniciando WebApp..." -ForegroundColor Yellow
az webapp restart --name $WebAppName --resource-group $ResourceGroup

Write-Host "✅ Completado. Espera 30 segundos y verifica:" -ForegroundColor Green
Write-Host "   curl https://$WebAppName.azurewebsites.net/health" -ForegroundColor Cyan
