# CONFIGURAR APP SETTINGS MANUALMENTE
# Debido a problemas con Azure CLI, usa Azure Portal:
# https://portal.azure.com/#@95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae/resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/lama-dev-rg/providers/Microsoft.Web/sites/lama-backend-dev/configuration

# O ejecuta estos comandos UNO POR UNO en PowerShell:

Write-Host "EJECUTA ESTOS COMANDOS UNO POR UNO:" -ForegroundColor Yellow
Write-Host ""

$commands = @"
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings PORT=8080

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings NODE_ENV=production

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_HOST=lama-pg-dev.postgres.database.azure.com

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_PORT=5432

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_USER=pgadmin@lama-pg-dev

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_NAME=lama_db

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings KEY_VAULT_NAME=lama-kv-dev99

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings APPINSIGHTS_INSTRUMENTATIONKEY=43d31ff7-79b9-4a57-9616-40740b25b778

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings "DB_PASS=@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/DB-PASSWORD)"

az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings "JWT_SECRET=@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/JWT-SECRET)"

az webapp restart -n lama-backend-dev -g lama-dev-rg
"@

Write-Host $commands -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "O USA AZURE PORTAL (MÁS RÁPIDO):" -ForegroundColor Yellow
Write-Host "https://portal.azure.com/#@95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae/resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/lama-dev-rg/providers/Microsoft.Web/sites/lama-backend-dev/configuration" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuración → Application settings → New application setting" -ForegroundColor White
Write-Host ""
Write-Host "VALORES A AGREGAR:" -ForegroundColor Yellow
@"
PORT = 8080
NODE_ENV = production
DB_HOST = lama-pg-dev.postgres.database.azure.com
DB_PORT = 5432
DB_USER = pgadmin@lama-pg-dev
DB_NAME = lama_db
KEY_VAULT_NAME = lama-kv-dev99
APPINSIGHTS_INSTRUMENTATIONKEY = 43d31ff7-79b9-4a57-9616-40740b25b778
DB_PASS = @Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/DB-PASSWORD)
JWT_SECRET = @Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/JWT-SECRET)
"@ | Write-Host -ForegroundColor Green
