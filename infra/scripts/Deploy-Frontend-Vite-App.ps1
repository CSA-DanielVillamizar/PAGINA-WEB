# Creates or updates a Linux App Service (Web App) for the Vite React SPA.
# Usage:
#   pwsh ./infra/scripts/Deploy-Frontend-Vite-App.ps1 -SubscriptionId <subId> -ResourceGroup <rg> -Location <location> -AppName <webapp-name> -ApiBaseUrl <https://lama-dev-backend.azurewebsites.net>
# Requires: Azure CLI logged in (az login) and pwsh.

param(
    [Parameter(Mandatory=$true)] [string]$SubscriptionId,
    [Parameter(Mandatory=$true)] [string]$ResourceGroup,
    [Parameter(Mandatory=$true)] [string]$Location,
    [Parameter(Mandatory=$true)] [string]$AppName,
    [Parameter(Mandatory=$true)] [string]$ApiBaseUrl,
    [string]$AppServicePlanName = "lama-dev-frontend-plan"
)

Write-Host "Setting subscription..." -ForegroundColor Cyan
az account set --subscription $SubscriptionId

Write-Host "Ensuring resource group '$ResourceGroup' in $Location..." -ForegroundColor Cyan
az group create -n $ResourceGroup -l $Location | Out-Null

Write-Host "Ensuring Linux App Service plan '$AppServicePlanName'..." -ForegroundColor Cyan
if (-not (az appservice plan show -n $AppServicePlanName -g $ResourceGroup -o tsv --query name 2>$null)) {
    az appservice plan create -n $AppServicePlanName -g $ResourceGroup --location $Location --is-linux --sku B1 | Out-Null
}

Write-Host "Ensuring Web App '$AppName'..." -ForegroundColor Cyan
if (-not (az webapp show -n $AppName -g $ResourceGroup -o tsv --query name 2>$null)) {
    az webapp create -n $AppName -g $ResourceGroup -p $AppServicePlanName --runtime "NODE:20-lts" | Out-Null
}

Write-Host "Configuring application settings for Vite frontend..." -ForegroundColor Cyan
$settingsPairs = @(
    "SCM_DO_BUILD_DURING_DEPLOYMENT=true",
    "WEBSITE_NODE_DEFAULT_VERSION=~20",
    "WEBSITES_PORT=3000",
    "PORT=3000",
    # For Vite, you can use VITE_API_BASE_URL; keep NEXT_PUBLIC for compatibility if already used
    "VITE_API_BASE_URL=$ApiBaseUrl",
    "NEXT_PUBLIC_API_BASE_URL=$ApiBaseUrl"
)
az webapp config appsettings set -g $ResourceGroup -n $AppName --settings $settingsPairs | Out-Null

Write-Host "Setting runtime and startup command..." -ForegroundColor Cyan
az webapp config set -g $ResourceGroup -n $AppName --linux-fx-version "node|20-lts" | Out-Null
az webapp config set -g $ResourceGroup -n $AppName --startup-file "pm2 serve /home/site/wwwroot --no-daemon --spa" | Out-Null

Write-Host "Vite Frontend Web App ready: https://$AppName.azurewebsites.net" -ForegroundColor Green
Write-Host "Deploy via GitHub Actions or Local Git; Oryx will build and output to wwwroot." -ForegroundColor Green
