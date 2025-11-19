# Deployment Guide - Azure Infrastructure

## Prerequisites
- Azure CLI installed and logged in
- Subscription ID: `f301f085-0a60-44df-969a-045b4375d4e7`
- Tenant ID: `95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae`
- Resource Group: `lama-rg-dev` (or create new)

## 1. Create Resource Group

```powershell
az login
az account set --subscription f301f085-0a60-44df-969a-045b4375d4e7
az group create --name lama-rg-dev --location eastus
```

## 2. Deploy Infrastructure with Bicep

```powershell
cd infra
az deployment group create `
  --resource-group lama-rg-dev `
  --template-file main.bicep `
  --parameters postgresAdminPassword="<STRONG_PASSWORD>"
```

### Parameters Override (opcional)
```powershell
az deployment group create `
  --resource-group lama-rg-dev `
  --template-file main.bicep `
  --parameters postgresAdminPassword="<PASSWORD>" `
               environment=dev `
               baseName=lama `
               postgresSkuName=B_Standard_B1ms `
               appServicePlanSkuName=P1v3
```

## 3. Configure App Settings (Post-Deployment)

### Get Resource Names
```powershell
$webAppName = az deployment group show -g lama-rg-dev -n main --query properties.outputs.webAppNameOut.value -o tsv
$kvName = az deployment group show -g lama-rg-dev -n main --query properties.outputs.keyVaultNameOut.value -o tsv
$pgServer = az deployment group show -g lama-rg-dev -n main --query properties.outputs.postgresServerName.value -o tsv
```

### Create Secrets in Key Vault
```powershell
az keyvault secret set --vault-name $kvName --name ENTRA-CLIENT-SECRET --value "<CLIENT_SECRET>"
az keyvault secret set --vault-name $kvName --name JWT-SECRET --value "<RANDOM_STRING_64_CHARS>"
az keyvault secret set --vault-name $kvName --name DB-PASSWORD --value "<POSTGRES_PASSWORD>"
```

### Assign Managed Identity Access to Key Vault
```powershell
$principalId = az webapp identity show -n $webAppName -g lama-rg-dev --query principalId -o tsv
$kvId = az keyvault show -n $kvName --query id -o tsv
az role assignment create --role "Key Vault Secrets User" --assignee $principalId --scope $kvId
```

### Configure Web App Settings with Key Vault References
```powershell
az webapp config appsettings set -g lama-rg-dev -n $webAppName --settings `
  NODE_ENV=production `
  MULTI_TENANT=true `
  ENTRA_TENANT_ID=95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae `
  ENTRA_CLIENT_ID="<CLIENT_ID_FROM_APP_REGISTRATION>" `
  ENTRA_CLIENT_SECRET="@Microsoft.KeyVault(SecretUri=https://$kvName.vault.azure.net/secrets/ENTRA-CLIENT-SECRET/)" `
  JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://$kvName.vault.azure.net/secrets/JWT-SECRET/)" `
  ALLOWED_EMAIL_DOMAIN=fundacionlamamedellin.org `
  DB_HOST="$pgServer.postgres.database.azure.com" `
  DB_PORT=5432 `
  DB_USER=pgadmin `
  DB_PASS="@Microsoft.KeyVault(SecretUri=https://$kvName.vault.azure.net/secrets/DB-PASSWORD/)" `
  DB_NAME=lama_db `
  FRONTEND_URL=https://fundacionlamamedellin.org
```

## 4. Configure PostgreSQL Firewall

```powershell
# Allow Azure services
az postgres flexible-server firewall-rule create `
  -g lama-rg-dev `
  -n $pgServer `
  --rule-name AllowAzure `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0

# Allow your local IP for admin tasks
$myIp = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
az postgres flexible-server firewall-rule create `
  -g lama-rg-dev `
  -n $pgServer `
  --rule-name AllowMyIP `
  --start-ip-address $myIp `
  --end-ip-address $myIp
```

## 5. Create Database

```powershell
# Connect via psql (install from https://www.postgresql.org/download/)
$pgHost = "$pgServer.postgres.database.azure.com"
psql "host=$pgHost port=5432 user=pgadmin dbname=postgres sslmode=require" -c "CREATE DATABASE lama_db;"
```

## 6. Deploy Backend Code

### Option A: GitHub Actions (Recommended)
1. Fork/clone repo to GitHub
2. Configure GitHub Secrets:
   ```
   AZURE_CREDENTIALS: Service Principal JSON
   ```
3. Create Service Principal:
   ```powershell
   az ad sp create-for-rbac --name lama-github-sp `
     --role Contributor `
     --scopes /subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/lama-rg-dev `
     --sdk-auth
   ```
4. Copy JSON output to GitHub Secret `AZURE_CREDENTIALS`
5. Push to `main` branch → workflow runs automatically

### Option B: Manual Deployment (Local)
```powershell
cd backend
npm run build
az webapp up --name $webAppName --resource-group lama-rg-dev --runtime "NODE:20-lts"
```

### Option C: Docker Container (Advanced)
```powershell
cd backend
docker build -t lama-backend:latest .
docker tag lama-backend:latest <ACR_NAME>.azurecr.io/lama-backend:latest
az acr login --name <ACR_NAME>
docker push <ACR_NAME>.azurecr.io/lama-backend:latest
az webapp config container set -n $webAppName -g lama-rg-dev `
  --docker-custom-image-name <ACR_NAME>.azurecr.io/lama-backend:latest
```

## 7. Run Database Migrations

```powershell
# Via Web App SSH console (Portal → Web App → SSH)
cd /home/site/wwwroot
node dist/main.js # Starts app with synchronize:true (dev only)

# Seed roles
curl -X POST https://$webAppName.azurewebsites.net/api/roles/seed
```

## 8. Verify Deployment

```powershell
$hostname = az webapp show -n $webAppName -g lama-rg-dev --query defaultHostName -o tsv
Write-Host "Swagger UI: https://$hostname/api/docs"
Write-Host "Health Check: https://$hostname/api/auth/login-url"

# Test login URL endpoint
curl https://$hostname/api/auth/login-url
```

## 9. Configure Custom Domain (Production)

```powershell
# Add custom domain
az webapp config hostname add -g lama-rg-dev --webapp-name $webAppName --hostname api.fundacionlamamedellin.org

# Create CNAME record in DNS provider:
# api.fundacionlamamedellin.org → lama-api-dev.azurewebsites.net

# Enable HTTPS (Free managed certificate)
az webapp config ssl bind -g lama-rg-dev --name $webAppName --certificate-thumbprint auto --ssl-type SNI
```

## 10. Monitoring & Logs

```powershell
# View logs
az webapp log tail -g lama-rg-dev -n $webAppName

# Enable Application Insights
$appInsightsKey = az deployment group show -g lama-rg-dev -n main --query properties.outputs.appInsightsInstrumentationKey.value -o tsv
az webapp config appsettings set -g lama-rg-dev -n $webAppName --settings APPINSIGHTS_INSTRUMENTATIONKEY=$appInsightsKey
```

## Cleanup (Delete All Resources)

```powershell
az group delete -n lama-rg-dev --yes --no-wait
```

## Troubleshooting

### Error: "Cannot connect to PostgreSQL"
- Check firewall rules include Web App outbound IP
- Verify connection string format: `host.postgres.database.azure.com`
- Ensure SSL mode: `sslmode=require`

### Error: "Key Vault access denied"
- Verify Managed Identity is enabled on Web App
- Check RBAC role assignment (Key Vault Secrets User)
- Wait 5-10 minutes for permissions to propagate

### Error: "ENTRA_CLIENT_SECRET not found"
- Ensure Key Vault reference syntax: `@Microsoft.KeyVault(SecretUri=...)`
- Check secret exists: `az keyvault secret show --vault-name $kvName --name ENTRA-CLIENT-SECRET`

## Cost Estimation (dev environment)

- PostgreSQL Flexible B1ms: ~$12/month
- App Service Plan P1v3: ~$200/month
- Key Vault: ~$0.50/month
- Storage Account (LRS): ~$2/month
- Application Insights: ~$10/month (first 5GB free)

**Total**: ~$225/month

For production, consider:
- PostgreSQL GP tier with replicas
- App Service Plan with auto-scale
- Azure Front Door + CDN
- Redis Cache for sessions
