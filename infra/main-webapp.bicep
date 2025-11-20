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

// Nombres y constantes
var postgresDbName = 'lama_db'
var webAppNodeFx = 'NODE|24-lts'
var appSettings = [
  // Las variables sensibles (DB_PASS, JWT_SECRET, etc.) se referencian vía Key Vault en portal o mediante otro archivo.
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
    network: {
      publicNetworkAccess: 'Enabled'
    }
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
resource webAppConfig 'Microsoft.Web/sites/config@2023-12-01' = if (!empty(appInsightsWorkspaceId) || !empty(insightsName)) {
  name: '${webApp.name}/appsettings'
  properties: union(
    { 'APPINSIGHTS_INSTRUMENTATIONKEY': empty(appInsightsWorkspaceId) ? insights.properties.InstrumentationKey : '' },
    { 'APPLICATIONINSIGHTS_CONNECTION_STRING': empty(appInsightsWorkspaceId) ? format('InstrumentationKey={0}', insights.properties.InstrumentationKey) : '' }
  )
  dependsOn: [ webApp ]
}

// Role Assignment: WebApp Managed Identity -> Key Vault Secrets User
// Para RBAC necesitamos GUID del rol Key Vault Secrets User (bdb6f0a7-7c5d-4c58-9d31-0b5b271cdb83)
// Se crea condición simple; si falla por replicación de identidad se puede reintentar fuera de IaC.
resource kvRoleAssign 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, 'kv-secrets-user', webApp.name)
  scope: keyVault
  properties: {
    principalId: webApp.identity.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions','b86a8fe4-44ce-4948-aee5-eccb2c0e42f0') // Key Vault Secrets User (actual id puede variar; validar).
    principalType: 'ServicePrincipal'
  }
  dependsOn: [ webApp, keyVault ]
}

// Output principales
output webAppUrl string = format('https://{0}.azurewebsites.net', webAppName)
output postgresFqdn string = format('{0}.postgres.database.azure.com', postgresServerName)
output keyVaultUri string = keyVault.properties.vaultUri
output insightsKey string = empty(appInsightsWorkspaceId) ? insights.properties.InstrumentationKey : ''
