# Setup-AzureCLI-Environment.ps1
# Configura el entorno de PowerShell para trabajar con Azure CLI detrás de un proxy corporativo

Write-Host "=== Configuración de Azure CLI para Red Corporativa ===" -ForegroundColor Cyan
Write-Host ""

# Deshabilitar verificación de certificados SSL (necesario para proxies con certificados autofirmados)
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = '1'
Write-Host "✓ AZURE_CLI_DISABLE_CONNECTION_VERIFICATION = 1" -ForegroundColor Green

# Suprimir warnings de Python sobre requests HTTPS no verificadas
$env:PYTHONWARNINGS = 'ignore:Unverified HTTPS request'
Write-Host "✓ PYTHONWARNINGS = ignore:Unverified HTTPS request" -ForegroundColor Green

Write-Host ""
Write-Host "Configuración completada. Los comandos az ahora funcionarán correctamente." -ForegroundColor Yellow
Write-Host ""
Write-Host "Ejemplo de uso:" -ForegroundColor Cyan
Write-Host "  az webapp list -o table" -ForegroundColor White
Write-Host "  az webapp show --name lama-frontend-dev --resource-group lama-dev-rg" -ForegroundColor White
Write-Host ""
Write-Host "NOTA: Esta configuración solo aplica a la sesión actual de PowerShell." -ForegroundColor Gray
Write-Host "      Para hacerla permanente, agregar estas líneas al perfil de PowerShell:" -ForegroundColor Gray
Write-Host "      `$PROFILE (típicamente: C:\Users\<usuario>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1)" -ForegroundColor Gray
