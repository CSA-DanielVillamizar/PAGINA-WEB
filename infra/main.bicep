// main.bicep - Infraestructura base para Fundación LAMA Medellín
// Recursos: Resource Group (externo), App Service Plan + WebApp Backend, Static Web App Frontend (opcional),
// PostgreSQL Flexible Server, Storage Account, Key Vault, Application Insights.
// NOTA: No se crean secrets aquí; se cargan luego a Key Vault manualmente o por pipeline.

param location string = resourceGroup().location
param environment string = 'dev' // dev|test|prod
param baseName string = 'lama'
param postgresAdminUser string = 'pgadmin'
@secure()
param postgresAdminPassword string
param postgresSkuName string = 'B_Standard_B1ms'
param postgresTier string = 'Burstable'
@description('SKU del App Service Plan')
param appServicePlanSku string = 'F1'
param appServicePlanSkuTier string = 'Free'
param frontendEnabled bool = true

// Convenciones de nombres (únicos globalmente para algunos recursos)
var suffix = uniqueString(resourceGroup().id, baseName, environment)
var storageName = toLower(replace('${baseName}${environment}${substring(suffix,0,6)}','-',''))
var keyVaultName = toLower('${baseName}-kv-${environment}')
var postgresName = toLower('${baseName}-pg-${environment}')
var appServicePlanName = '${baseName}-asp-${environment}'
var webAppName = '${baseName}-api-${environment}'
var insightsName = '${baseName}-appi-${environment}'

// Application Insights
resource appInsights 'Microsoft.Insights/components@2023-02-01' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// Storage Account
resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// Key Vault (sin deshabilitar purge protection)
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { name: 'standard', family: 'A' }
    enableSoftDelete: true
    enablePurgeProtection: true
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// PostgreSQL Flexible Server
resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: postgresName
  location: location
  sku: {
    name: postgresSkuName
    tier: postgresTier
  }
  properties: {
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    version: '16'
    storage: {
      storageSizeGB: 32
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
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
    tier: appServicePlanSkuTier
  }
  properties: {
    reserved: false
    perSiteScaling: false
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// Backend Web App (API)
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '1' }
        { name: 'APPINSIGHTS_INSTRUMENTATIONKEY', value: appInsights.properties.InstrumentationKey }
        { name: 'DB_HOST', value: pgServer.name }
        { name: 'DB_PORT', value: '5432' }
        { name: 'DB_USER', value: postgresAdminUser }
        // Password se referenciará luego desde Key Vault mediante Azure DevOps / GitHub Actions secret injection
        { name: 'DB_NAME', value: 'lama_db' }
        { name: 'NODE_ENV', value: environment }
      ]
    }
  }
  tags: {
    environment: environment
    app: baseName
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// Outputs clave para pipeline
output storageAccountName string = storage.name
output keyVaultNameOut string = keyVault.name
output postgresServerName string = pgServer.name
output webAppNameOut string = webApp.name
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
