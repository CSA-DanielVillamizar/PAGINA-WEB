// main-dev-basic.bicep
// Plantilla simplificada para ambiente de Desarrollo.
// Objetivo: crear solo los recursos esenciales con buenas prácticas básicas,
// evitando complejidad de red privada/VNet. Uso de acceso público controlado en PostgreSQL.
// Incluye: App Service Plan (Linux, Node 24), Web App, PostgreSQL Flexible Server,
// Key Vault (RBAC), Storage Account, Application Insights (clásico) y asignación de rol
// "Key Vault Secrets User" a la identidad administrada de la Web App.
//
// Buenas prácticas aplicadas:
// - TLS mínimo 1.2 en Storage y HTTPS Only en Web App.
// - Key Vault con purge protection + soft delete + RBAC (sin access policies lineales).
// - Identidad administrada SystemAssigned en la Web App para acceso a Key Vault.
// - Rol Key Vault Secrets User (mínimo privilegio para secretos).
// - PostgreSQL con backup retention y sin HA (coste mínimo dev) y firewall para servicios Azure.
// - Tags homogéneos para gobernanza.
// - Parametrización clara para reutilización.
//
// NOTA: Para producción se recomienda agregar: VNet privada, Private DNS, SKU superior,
// restricción de IPs cliente específica y rotación de secretos automatizada.

@description('Región de despliegue')
param location string = resourceGroup().location
@description('Nombre de la Web App (DNS)')
param webAppName string
@description('Nombre del App Service Plan')
param planName string
@description('Nombre del servidor PostgreSQL Flexible')
param postgresServerName string
@description('Usuario administrador PostgreSQL')
param postgresAdminUser string = 'pgadmin'
@secure()
@description('Password administrador PostgreSQL')
param postgresAdminPassword string
@description('Nombre del Key Vault')
param keyVaultName string
@description('Nombre de Storage Account (único, sin guiones)')
param storageAccountName string
@description('Nombre de Application Insights')
param insightsName string
@description('Tags comunes')
param tags object = {
  environment: 'dev'
  workload: 'backend-api'
  owner: 'lama'
  costCenter: 'foundation'
}

// Constantes y derivaciones
var nodeRuntime = 'NODE|24-lts'
var postgresDbName = 'lama_db'
var roleKeyVaultSecretsUser = 'b86a8fe4-44ce-4948-aee5-eccb2c0e42f0'

// App Service Plan (Linux Básico B1 para dev; ajustar si se requiere)
resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
  tags: tags
}

// Key Vault (RBAC; sin accessPolicies para usar roles)
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      name: 'standard'
      family: 'A'
    }
    enableSoftDelete: true
    enablePurgeProtection: true
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
  }
  tags: tags
}

// Storage Account (Seguridad básica: TLS 1.2, sin blob público)
resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    accessTier: 'Hot'
  }
  tags: tags
}

// PostgreSQL Flexible Server
resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: postgresServerName
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
  tags: tags
}

// Regla firewall para permitir servicios Azure (0.0.0.0)
resource pgFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
  parent: pgServer
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Application Insights (clásico, no workspace-based en dev simplificado)
resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
  tags: tags
}

// Web App (Linux, Node 24 LTS, HTTPS Only)
resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: nodeRuntime
      appSettings: [
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
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: insights.properties.InstrumentationKey
        }
      ]
      http20Enabled: true
      alwaysOn: true
      ftpsState: 'Disabled'
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
  tags: tags
  dependsOn: [ pgServer ]
}

// Role Assignment: WebApp Managed Identity -> Key Vault Secrets User
resource kvRoleAssign 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, 'kv-secrets-user', webApp.name)
  scope: keyVault
  properties: {
    principalId: webApp.identity.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleKeyVaultSecretsUser)
    principalType: 'ServicePrincipal'
  }
}

// Salidas
output webAppUrl string = format('https://{0}.azurewebsites.net', webAppName)
output postgresFqdn string = format('{0}.postgres.database.azure.com', postgresServerName)
output keyVaultUri string = keyVault.properties.vaultUri
output insightsKey string = insights.properties.InstrumentationKey
output storageAccountOut string = storage.name
