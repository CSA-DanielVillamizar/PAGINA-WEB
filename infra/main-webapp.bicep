// main-webapp.bicep
// Infra completa para despliegue de Web App (Código) Node 24 LTS + PostgreSQL Flexible Server + Key Vault + Storage + Application Insights.
// Limpieza total de PostgreSQL (recrea el servidor). No conserva datos previos.
// Parametrizado para entornos. Usa buenas prácticas: Managed Identity, referencias a Key Vault, TLS y RBAC mínimo.

param location string = resourceGroup().location
param webAppName string
param planName string
param planSkuName string = 'P1v2' // Ajustar según costo (B1 para dev, P1v2 para prod)
param postgresServerName string
param postgresAdminUser string = 'pgadmin'
@secure()
param postgresAdminPassword string
param postgresVersion string = '16'
param postgresTier string = 'Burstable'
param postgresSkuName string = 'Standard_B1ms'
param postgresStorageMb int = 32768 // 32 GB
param keyVaultName string
param storageAccountName string
param insightsName string
param appInsightsWorkspaceId string = '' // Opcional: si se quiere workspace-based
@description('URL del frontend para CORS (ej: https://app.fundacionlamamedellin.org)')
param frontendUrl string = ''
@description('Habilitar healthcheck automático en App Service mediante WEBSITE_HEALTHCHECK_URL')
param enableHealthcheck bool = true
@description('URI del secreto en Key Vault para la contraseña de la base (DB_PASS). Si vacío no se agrega.')
param dbPassSecretUri string = ''

// Nombres y constantes
var postgresDbName = 'lama_db'
var webAppNodeFx = 'NODE|24-lts'
// App settings consolidadas (sin condicionales inline para compatibilidad).
var appSettings = [
  {
    name: 'PORT'
    value: '8080'
  }
  {
    name: 'NODE_ENV'
    value: 'production'
  }
  {
    name: 'DB_HOST'
    value: format('{0}.postgres.database.azure.com', postgresServerName)
  }
  {
    name: 'DB_PORT'
    value: '5432'
  }
  {
    name: 'DB_USER'
    value: format('{0}@{1}', postgresAdminUser, postgresServerName)
  }
  {
    name: 'DB_NAME'
    value: postgresDbName
  }
  {
    name: 'KEY_VAULT_NAME'
    value: keyVaultName
  }
  {
    name: 'DISABLE_DB'
    value: '0'
  }
  {
    name: 'FRONTEND_URL'
    value: empty(frontendUrl) ? 'http://localhost:5173' : frontendUrl
  }
  {
    name: 'WEBSITE_HEALTHCHECK_URL'
    value: enableHealthcheck ? '/health' : ''
  }
  {
    name: 'DB_PASS'
    value: empty(dbPassSecretUri) ? 'SET_KEYVAULT_SECRET_URI' : format('@Microsoft.KeyVault(SecretUri={0})', dbPassSecretUri)
  }
]

// App Service Plan
resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  sku: {
    name: planSkuName
    tier: planSkuName == 'B1' ? 'Basic' : 'PremiumV2'
    size: planSkuName
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true // Linux
  }
}

// PostgreSQL Flexible Server (limpieza total - recrea servidor)
resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: postgresServerName
  location: location
  sku: {
    name: postgresSkuName
    tier: postgresTier
  }
  properties: {
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    version: postgresVersion
    storage: {
      storageSizeGB: int(postgresStorageMb / 1024)
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    // network configurado por defecto (public access habilitado). Propiedad publicNetworkAccess omitida para evitar errores de versión.
    maintenanceWindow: {
      customWindow: 'Disabled'
    }
    availabilityZone: '1'
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enablePurgeProtection: true
    enableSoftDelete: true
    accessPolicies: [] // Usaremos RBAC (enable-rbac-authorization de forma externa).
  }
}

// Storage Account
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    accessTier: 'Hot'
  }
}

// Application Insights (Classic si no se pasa workspace)
resource insights 'Microsoft.Insights/components@2020-02-02' = if (empty(appInsightsWorkspaceId)) {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// Web App (Code) Node 24 LTS
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: webAppNodeFx
      appSettings: appSettings
      alwaysOn: true
      http20Enabled: true
      ftpsState: 'Disabled'
    }
    httpsOnly: true
  }
  identity: {
    type: 'SystemAssigned'
  }
  dependsOn: [ pgServer ]
}

// Optional: Web App settings for App Insights if created

// Nota: La asignación de rol (Key Vault Secrets User) se realizará post-despliegue via CLI
// para evitar errores de validación por GUID de rol o replicación de identidad.

// Output principales
output webAppUrl string = format('https://{0}.azurewebsites.net', webAppName)
output postgresFqdn string = format('{0}.postgres.database.azure.com', postgresServerName)
output keyVaultUri string = keyVault.properties.vaultUri
output insightsKey string = ''
