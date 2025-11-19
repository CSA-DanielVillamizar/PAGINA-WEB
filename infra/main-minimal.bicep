// main-minimal.bicep - Infraestructura mínima: PostgreSQL, Storage, Key Vault
// Esto evita problemas de cuota con App Service y Container Apps
// NOTA: Usar Central US para evitar restricciones regionales

param location string = 'centralus'
param environment string = 'dev'
param baseName string = 'lama'
param postgresAdminUser string = 'pgadmin'
@secure()
param postgresAdminPassword string

// Convenciones de nombres
var suffix = uniqueString(resourceGroup().id, baseName, environment)
var storageName = toLower(replace('${baseName}${environment}${substring(suffix,0,6)}','-',''))
var keyVaultName = toLower('${baseName}-kv-${environment}-${substring(suffix,0,4)}')
var postgresName = toLower('${baseName}-pg-${environment}')

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
    name: 'Standard_B1ms'
    tier: 'Burstable'
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

// Firewall rule: permitir servicios de Azure
resource pgFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: pgServer
  name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Outputs
output storageAccountName string = storage.name
output keyVaultNameOut string = keyVault.name
output postgresServerName string = pgServer.name
output postgresServerFQDN string = '${pgServer.name}.postgres.database.azure.com'
