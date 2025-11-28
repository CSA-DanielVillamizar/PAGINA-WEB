// Infraestructura simplificada para desarrollo
// Sin Key Vault ni recursos complejos - solo lo esencial
targetScope = 'resourceGroup'

@description('Ubicación de los recursos')
param location string

@description('Ambiente (dev, staging, prod)')
param environment string

@description('Nombre del proyecto')
param projectName string

@description('Admin de PostgreSQL')
@secure()
param postgresAdminPassword string

@description('JWT Secret')
@secure()
param jwtSecret string

@description('URL del frontend')
param frontendUrl string

var resourcePrefix = '${projectName}-${environment}'
var storageAccountName = replace('${resourcePrefix}storage', '-', '')

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: '${resourcePrefix}-pg'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'lamadmin'
    administratorLoginPassword: postgresAdminPassword
    version: '15'
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
  }
}

// Firewall rule para permitir servicios de Azure
resource postgresFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Firewall rule para desarrollo local
resource postgresFirewallAll 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAll'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

// Base de datos
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'lamadb'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Storage Account para blobs
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}

// App Service Plan (Linux)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${resourcePrefix}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// Web App para backend
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${resourcePrefix}-backend'
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'false'
        }
        // Database
        {
          name: 'DB_HOST'
          value: postgresServer.properties.fullyQualifiedDomainName
        }
        {
          name: 'DB_PORT'
          value: '5432'
        }
        {
          name: 'DB_USERNAME'
          value: 'lamadmin'
        }
        {
          name: 'DB_PASSWORD'
          value: postgresAdminPassword
        }
        {
          name: 'DB_DATABASE'
          value: 'lamadb'
        }
        {
          name: 'DB_SSL'
          value: 'true'
        }
        // JWT
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'JWT_EXPIRATION'
          value: '7d'
        }
        // CORS
        {
          name: 'FRONTEND_URL'
          value: frontendUrl
        }
        // Azure Storage
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'AZURE_STORAGE_CONTAINER_NAME'
          value: 'uploads'
        }
        // Features (deshabilitados para desarrollo simple)
        {
          name: 'FEATURE_BLOB_REQUIRED'
          value: 'false'
        }
        {
          name: 'FEATURE_EMAIL_REQUIRED'
          value: 'false'
        }
        {
          name: 'ENABLE_SWAGGER'
          value: '0'
        }
        // Health check path
        {
          name: 'WEBSITE_HEALTHCHECK_MAXPINGFAILURES'
          value: '10'
        }
      ]
    }
  }
}

// Health check configuration
resource webAppConfig 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: webApp
  name: 'web'
  properties: {
    healthCheckPath: '/health'
  }
}

// Outputs
output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
