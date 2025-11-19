# Script para configurar App Settings con referencias a Key Vault
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1

Write-Host "Obteniendo URIs de secretos..."
$uriClientId = az keyvault secret show --vault-name lama-kv-cus2025 --name ENTRA-CLIENT-ID --query id -o tsv
$uriClientSecret = az keyvault secret show --vault-name lama-kv-cus2025 --name ENTRA-CLIENT-SECRET --query id -o tsv
$uriJwtSecret = az keyvault secret show --vault-name lama-kv-cus2025 --name JWT-SECRET --query id -o tsv
$uriDbPassword = az keyvault secret show --vault-name lama-kv-cus2025 --name DB-PASSWORD --query id -o tsv

Write-Host "Configurando App Settings..."

# Crear objeto JSON con todos los settings
$settings = @{
    "ENTRA_CLIENT_ID" = "@Microsoft.KeyVault(SecretUri=$uriClientId)"
    "ENTRA_CLIENT_SECRET" = "@Microsoft.KeyVault(SecretUri=$uriClientSecret)"
    "JWT_SECRET" = "@Microsoft.KeyVault(SecretUri=$uriJwtSecret)"
    "DB_PASSWORD" = "@Microsoft.KeyVault(SecretUri=$uriDbPassword)"
    "MULTI_TENANT" = "true"
    "ALLOWED_EMAIL_DOMAIN" = "fundacionlamamedellin.org"
    "DB_HOST" = "lama-pg-dev.postgres.database.azure.com"
    "DB_NAME" = "lama_db"
    "DB_USER" = "pgadmin"
    "DB_PORT" = "5432"
    "DB_SSL" = "true"
}

# Convertir a array de strings para --settings
$settingsArray = $settings.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }

# Aplicar settings
az webapp config appsettings set `
    --resource-group lama-foundation-rg `
    --name lama-backend-app `
    --settings @settingsArray

Write-Host "App Settings configurados correctamente"
