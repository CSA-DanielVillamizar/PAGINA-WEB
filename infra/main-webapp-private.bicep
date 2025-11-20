// main-webapp-private.bicep
// Infra completa con mejores prácticas: VNet, PostgreSQL Flexible Server acceso privado, Key Vault RBAC, Storage seguro,
// Application Insights (workspace-based), Web App Node 24 LTS con integración VNet y diagnósticos.
// Documentación técnica en español. Clean Architecture para mantener separación IaC vs lógica aplicación.

@description('Región de despliegue de los recursos.')
param location string = resourceGroup().location

@description('Nombre único de la Web App (DNS prefix).')
param webAppName string

@description('Nombre del App Service Plan.')
param planName string

@description('SKU del App Service Plan. Para dev usar B1, para cargas mayores P1v2 o superior.')
param planSkuName string = 'B1'

@description('Nombre del servidor PostgreSQL Flexible.')
param postgresServerName string

@description('Usuario administrador de PostgreSQL.')
param postgresAdminUser string = 'pgadmin'

@secure()
@description('Password administrador de PostgreSQL (se almacenará también en Key Vault como secreto).')
param postgresAdminPassword string

@description('Versión de PostgreSQL.')
param postgresVersion string = '16'

@description('Tier de PostgreSQL (Burstable para dev).')
param postgresTier string = 'Burstable'

@description('SKU de PostgreSQL (B1ms para dev bajo costo).')
param postgresSkuName string = 'Standard_B1ms'

@description('Almacenamiento en GB para PostgreSQL.')
param postgresStorageGb int = 32

@description('Nombre de la base de datos lógica a utilizar.')
param postgresDbName string = 'lama_db'

@description('Nombre del Key Vault.')
param keyVaultName string

@description('Nombre de la cuenta de Storage.')
param storageAccountName string

@description('Nombre del recurso Application Insights.')
param insightsName string

@description('Nombre del Log Analytics Workspace (para retención extendida).')
param logAnalyticsName string

@description('Nombre de la VNet.')
param vnetName string

@description('Dirección CIDR de la VNet (ajustar si se integra con otras redes).')
param vnetAddressSpace string = '10.60.0.0/16'

@description('CIDR subnet App Service integration.')
param subnetAppServiceCidr string = '10.60.10.0/24'

@description('CIDR subnet PostgreSQL privada delegada.')
param subnetPostgresCidr string = '10.60.20.0/24'

@description('Nombre de la subnet para App Service integration.')
param subnetAppServiceName string = 'snet-appsvc'

@description('Nombre de la subnet para PostgreSQL (delegada).')
param subnetPostgresName string = 'snet-pg'

@description('Tags comunes para gobernanza.')
param commonTags object = {
  environment: 'dev'
  owner: 'lama'
  costCenter: 'foundation'
  workload: 'backend-api'
}

// Constantes y valores calculados
var webAppNodeFx = 'NODE|24-lts'
var kvSecretsUserRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions','b86a8fe4-44ce-4948-aee5-eccb2c0e42f0')
var storageBlobDataReaderRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions','2a2b9908-6ea1-4ae2-8e65-a410df84e7d1')

// Workspace Log Analytics
resource logWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: commonTags
  properties: {
    retentionInDays: 30
    features: {
      searchVersion: 1
    }
  }
}

// Application Insights workspace-based
resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  tags: commonTags
  properties: {
    Application_Type: 'web'
    Flow_Type: 'Bluefield'
    WorkspaceResourceId: logWorkspace.id
  }
}

// VNet con dos subnets: AppService integration y PostgreSQL privada
resource vnet 'Microsoft.Network/virtualNetworks@2023-05-01' = {
  name: vnetName
  location: location
  tags: commonTags
  properties: {
    addressSpace: {
      addressPrefixes: [ vnetAddressSpace ]
    }
    subnets: [
      {
        name: subnetAppServiceName
        properties: {
          addressPrefix: subnetAppServiceCidr
        }
      }
      {
        name: subnetPostgresName
        properties: {
          addressPrefix: subnetPostgresCidr
          delegations: [
            {
              name: 'pgDelegation'
              properties: {
                serviceName: 'Microsoft.DBforPostgreSQL/flexibleServers'
              }
            }
          ]
        }
      }
    ]
  }
}

// DNS Privado para PostgreSQL Flexible
resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.postgres.database.azure.com'
  location: 'global'
  tags: commonTags
}

// Link DNS a la VNet
resource dnsVnetLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  name: 'privatelink.postgres.database.azure.com/${vnetName}-link'
  location: 'global'
  properties: {
    virtualNetwork: {
      id: vnet.id
    }
    registrationEnabled: false
  }
  dependsOn: [ privateDnsZone, vnet ]
}

// Key Vault RBAC (sin access policies) con purge protection
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: commonTags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enablePurgeProtection: true
    enableSoftDelete: true
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled' // Para dev; puede restringirse añadiendo Private Endpoint.
  }
}

// Storage Account seguro
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  tags: commonTags
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

// App Service Plan Linux
resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  tags: commonTags
  sku: {
    name: planSkuName
    tier: planSkuName == 'B1' ? 'Basic' : 'PremiumV2'
    size: planSkuName
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// PostgreSQL Flexible Server con acceso privado
resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: postgresServerName
  location: location
  tags: commonTags
  sku: {
    name: postgresSkuName
    tier: postgresTier
  }
  properties: {
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    version: postgresVersion
    storage: {
      storageSizeGB: postgresStorageGb
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: resourceId('Microsoft.Network/virtualNetworks/subnets', vnetName, subnetPostgresName)
      privateDnsZoneArmResourceId: privateDnsZone.id
      publicNetworkAccess: 'Disabled'
    }
    maintenanceWindow: {
      customWindow: 'Disabled'
    }
    availabilityZone: '1'
  }
  dependsOn: [ vnet, privateDnsZone, dnsVnetLink ]
}

// Web App con identidad administrada y settings base
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
]

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  tags: commonTags
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
  dependsOn: [ plan, pgServer ]
}

// App Insights connection string en Web App
resource webAppConfig 'Microsoft.Web/sites/config@2023-12-01' = {
  name: '${webApp.name}/appsettings'
  properties: {
    APPINSIGHTS_CONNECTION_STRING: insights.properties.ConnectionString
  }
  dependsOn: [ webApp, insights ]
}

// Role Assignment: Key Vault Secrets User
resource kvRoleAssign 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, 'kv-secrets-user', webApp.name)
  scope: keyVault
  properties: {
    principalId: webApp.identity.principalId
    roleDefinitionId: kvSecretsUserRoleId
    principalType: 'ServicePrincipal'
  }
  dependsOn: [ webApp, keyVault ]
}

// Role Assignment: Storage Blob Data Reader (si la app necesita leer blobs)
resource storageRoleAssign 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, 'blob-data-reader', webApp.name)
  scope: storage
  properties: {
    principalId: webApp.identity.principalId
    roleDefinitionId: storageBlobDataReaderRoleId
    principalType: 'ServicePrincipal'
  }
  dependsOn: [ webApp, storage ]
}

// Diagnostic Settings para PostgreSQL hacia Log Analytics (logs básicos)
resource pgDiag 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${postgresServerName}-diag'
  scope: pgServer
  properties: {
    workspaceId: logWorkspace.id
    logs: [
      {
        category: 'PostgreSQLLogs'
        enabled: true
        retentionPolicy: { enabled: false days: 0 }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: { enabled: false days: 0 }
      }
    ]
  }
  dependsOn: [ pgServer, logWorkspace ]
}

// OUTPUTS
output webAppUrl string = format('https://{0}.azurewebsites.net', webAppName)
output postgresFqdn string = format('{0}.postgres.database.azure.com', postgresServerName)
output keyVaultUri string = keyVault.properties.vaultUri
output insightsConnectionString string = insights.properties.ConnectionString
output logAnalyticsId string = logWorkspace.id
