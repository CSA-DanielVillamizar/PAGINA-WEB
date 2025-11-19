// main-containerapp.bicep - Infraestructura con Azure Container Apps (sin cuotas restrictivas)
// Recursos: Container Apps Environment, Container App, PostgreSQL Flexible Server, Storage Account, Key Vault, Application Insights

param location string = resourceGroup().location
param environment string = 'dev' // dev|test|prod
param baseName string = 'lama'
param postgresAdminUser string = 'pgadmin'
@secure()
param postgresAdminPassword string
param postgresSkuName string = 'Standard_B2s'
param postgresTier string = 'Burstable'

// Convenciones de nombres (únicos globalmente para algunos recursos)
var suffix = uniqueString(resourceGroup().id, baseName, environment)
var storageName = toLower(replace('${baseName}${environment}${substring(suffix,0,6)}','-',''))
var keyVaultName = toLower('${baseName}-kv-${environment}')
var postgresName = toLower('${baseName}-pg-${environment}')
var containerAppEnvName = '${baseName}-caenv-${environment}'
var containerAppName = '${baseName}-api-${environment}'
var insightsName = '${baseName}-appi-${environment}'
var logAnalyticsName = '${baseName}-logs-${environment}'

// Log Analytics Workspace (requerido para Container Apps)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
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

// Key Vault
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

// Container Apps Environment
resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// Container App (Backend API)
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      secrets: [
        {
          name: 'postgres-password'
          value: postgresAdminPassword
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend-api'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest' // Placeholder - se actualizará con tu imagen
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: environment
            }
            {
              name: 'DB_HOST'
              value: '${pgServer.name}.postgres.database.azure.com'
            }
            {
              name: 'DB_PORT'
              value: '5432'
            }
            {
              name: 'DB_USER'
              value: postgresAdminUser
            }
            {
              name: 'DB_PASS'
              secretRef: 'postgres-password'
            }
            {
              name: 'DB_NAME'
              value: 'lama_db'
            }
            {
              name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
              value: appInsights.properties.InstrumentationKey
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  tags: {
    environment: environment
    app: baseName
  }
}

// Outputs clave para pipeline
output storageAccountName string = storage.name
output keyVaultNameOut string = keyVault.name
output postgresServerName string = pgServer.name
output containerAppName string = containerApp.name
output containerAppFQDN string = containerApp.properties.configuration.ingress.fqdn
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output logAnalyticsWorkspaceId string = logAnalytics.id
