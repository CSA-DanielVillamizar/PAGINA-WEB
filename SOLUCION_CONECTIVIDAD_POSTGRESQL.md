# Soluciones para Conectividad PostgreSQL desde Azure App Service

**Problema Actual**: El backend en Azure App Service no puede conectarse a PostgreSQL Flexible Server, aunque:
- ✅ KeyVault resuelve la contraseña correctamente
- ✅ Reglas de firewall configuradas (5 IPs salientes)
- ✅ PostgreSQL tiene acceso público habilitado
- ✅ Migraciones funcionan desde local

**Configuración Actual**:
- App Service Plan: `lama-asp-dev` (Standard S1, Linux) ✅ Soporta VNet Integration
- PostgreSQL: `lama-pg-dev` (Flexible Server, acceso público)
- Resource Group: `lama-dev-rg`
- Región: probablemente East US o Central US

---

## Opción 1: VNet Integration + Private Link (RECOMENDADO)

### Ventajas
- ✅ Seguridad máxima (tráfico privado dentro de Azure)
- ✅ No depende de IPs públicas dinámicas
- ✅ Mejor rendimiento (latencia reducida)
- ✅ Cumple con mejores prácticas de Azure

### Desventajas
- ⚠️ Requiere crear VNet y subnets
- ⚠️ Costo adicional de Private Link (~$7-10/mes)
- ⚠️ Configuración más compleja

### Pasos de Implementación

#### 1.1. Crear Virtual Network y Subnets

```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION='1'

# Crear VNet
az network vnet create `
  --name lama-vnet `
  --resource-group lama-dev-rg `
  --address-prefix 10.0.0.0/16 `
  --location eastus

# Crear subnet para App Service (VNet Integration)
az network vnet subnet create `
  --name app-service-subnet `
  --resource-group lama-dev-rg `
  --vnet-name lama-vnet `
  --address-prefix 10.0.1.0/24 `
  --delegations Microsoft.Web/serverFarms

# Crear subnet para PostgreSQL Private Endpoint
az network vnet subnet create `
  --name postgres-subnet `
  --resource-group lama-dev-rg `
  --vnet-name lama-vnet `
  --address-prefix 10.0.2.0/24
```

#### 1.2. Configurar VNet Integration en App Service

```powershell
# Integrar App Service con VNet
az webapp vnet-integration add `
  --name lama-backend-dev `
  --resource-group lama-dev-rg `
  --vnet lama-vnet `
  --subnet app-service-subnet

# Configurar para enrutar todo el tráfico por VNet
az webapp config appsettings set `
  --name lama-backend-dev `
  --resource-group lama-dev-rg `
  --settings WEBSITE_VNET_ROUTE_ALL=1
```

#### 1.3. Crear Private Endpoint para PostgreSQL

```powershell
# Deshabilitar acceso público en PostgreSQL
az postgres flexible-server update `
  --name lama-pg-dev `
  --resource-group lama-dev-rg `
  --public-network-access Disabled

# Crear Private Endpoint
az network private-endpoint create `
  --name lama-pg-private-endpoint `
  --resource-group lama-dev-rg `
  --vnet-name lama-vnet `
  --subnet postgres-subnet `
  --private-connection-resource-id $(az postgres flexible-server show --name lama-pg-dev --resource-group lama-dev-rg --query id -o tsv) `
  --group-id postgresqlServer `
  --connection-name lama-pg-connection

# Crear Private DNS Zone
az network private-dns zone create `
  --name privatelink.postgres.database.azure.com `
  --resource-group lama-dev-rg

# Vincular DNS Zone con VNet
az network private-dns link vnet create `
  --name lama-pg-dns-link `
  --resource-group lama-dev-rg `
  --zone-name privatelink.postgres.database.azure.com `
  --virtual-network lama-vnet `
  --registration-enabled false

# Configurar DNS para Private Endpoint
az network private-endpoint dns-zone-group create `
  --name lama-pg-dns-group `
  --resource-group lama-dev-rg `
  --endpoint-name lama-pg-private-endpoint `
  --private-dns-zone privatelink.postgres.database.azure.com `
  --zone-name postgresqlServer
```

#### 1.4. Actualizar cadena de conexión

El hostname cambiará a: `lama-pg-dev.privatelink.postgres.database.azure.com`

Actualizar app settings:
```powershell
az webapp config appsettings set `
  --name lama-backend-dev `
  --resource-group lama-dev-rg `
  --settings DB_HOST=lama-pg-dev.privatelink.postgres.database.azure.com
```

---

## Opción 2: Service Endpoint (Más Simple)

### Ventajas
- ✅ Más simple que Private Link
- ✅ Sin costo adicional
- ✅ Tráfico va por backbone de Azure

### Desventajas
- ⚠️ PostgreSQL sigue accesible públicamente
- ⚠️ Menos seguro que Private Link

### Pasos de Implementación

#### 2.1. Crear VNet y Subnet con Service Endpoint

```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION='1'

# Crear VNet
az network vnet create `
  --name lama-vnet `
  --resource-group lama-dev-rg `
  --address-prefix 10.0.0.0/16 `
  --location eastus

# Crear subnet con Service Endpoint para PostgreSQL
az network vnet subnet create `
  --name app-service-subnet `
  --resource-group lama-dev-rg `
  --vnet-name lama-vnet `
  --address-prefix 10.0.1.0/24 `
  --delegations Microsoft.Web/serverFarms `
  --service-endpoints Microsoft.Sql
```

#### 2.2. Configurar VNet Integration

```powershell
az webapp vnet-integration add `
  --name lama-backend-dev `
  --resource-group lama-dev-rg `
  --vnet lama-vnet `
  --subnet app-service-subnet

az webapp config appsettings set `
  --name lama-backend-dev `
  --resource-group lama-dev-rg `
  --settings WEBSITE_VNET_ROUTE_ALL=1
```

#### 2.3. Configurar regla de firewall basada en VNet en PostgreSQL

```powershell
# Agregar regla de VNet
az postgres flexible-server vnet-rule create `
  --name allow-app-service `
  --resource-group lama-dev-rg `
  --server-name lama-pg-dev `
  --vnet-name lama-vnet `
  --subnet app-service-subnet
```

---

## Opción 3: Diagnóstico Avanzado + Solución de Firewall

### Esta opción intenta resolver el problema sin VNet

#### 3.1. Verificar que todas las IPs salientes estén en el firewall

```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION='1'

# Obtener TODAS las IPs posibles (incluyendo possibleOutboundIpAddresses)
$allIps = az webapp show `
  --name lama-backend-dev `
  --resource-group lama-dev-rg `
  --query "possibleOutboundIpAddresses" -o tsv

# Dividir y agregar cada IP
$allIps -split ',' | ForEach-Object {
  $ip = $_.Trim()
  $ruleName = "AppService-IP-$($ip -replace '\.','-')"
  
  Write-Host "Agregando regla para IP: $ip"
  az postgres flexible-server firewall-rule create `
    --resource-group lama-dev-rg `
    --name $ruleName `
    --server-name lama-pg-dev `
    --start-ip-address $ip `
    --end-ip-address $ip
}
```

#### 3.2. Verificar configuración SSL de PostgreSQL

```powershell
# Verificar si require_secure_transport está habilitado
az postgres flexible-server parameter show `
  --resource-group lama-dev-rg `
  --server-name lama-pg-dev `
  --name require_secure_transport

# Si está en ON, verificar que el código use SSL
# Ya configurado en data-source.ts:
# ssl: { rejectUnauthorized: false }
```

#### 3.3. Probar conexión desde App Service usando SSH

```powershell
# Habilitar SSH en App Service (ya debería estar habilitado)
az webapp config appsettings set `
  --name lama-backend-dev `
  --resource-group lama-dev-rg `
  --settings SSH_ENABLED=true

# Abrir SSH en portal y ejecutar:
# curl -v telnet://lama-pg-dev.postgres.database.azure.com:5432
```

#### 3.4. Verificar timeout de conexión TCP

Agregar configuración de timeout más agresiva:

```typescript
// En data-source.ts (ya implementado):
connectTimeoutMS: 10000,
extra: {
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
}
```

#### 3.5. Verificar NSG (Network Security Groups)

```powershell
# Listar NSGs en el resource group
az network nsg list --resource-group lama-dev-rg -o table

# Si existe alguno, verificar reglas outbound
az network nsg rule list `
  --resource-group lama-dev-rg `
  --nsg-name <nombre-nsg> `
  --query "[?direction=='Outbound']" -o table
```

---

## Recomendación Final

**Para entorno de desarrollo**: Usar **Opción 3** primero (diagnóstico + todas las IPs)

**Para producción**: Implementar **Opción 1** (VNet Integration + Private Link)

### Script de Diagnóstico Rápido

```powershell
# Ejecutar este script para diagnóstico completo
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION='1'

Write-Host "=== DIAGNÓSTICO DE CONECTIVIDAD POSTGRESQL ===" -ForegroundColor Cyan

# 1. Verificar IPs salientes
Write-Host "`n1. IPs salientes del App Service:" -ForegroundColor Yellow
az webapp show --name lama-backend-dev --resource-group lama-dev-rg --query "possibleOutboundIpAddresses" -o tsv

# 2. Verificar reglas de firewall actuales
Write-Host "`n2. Reglas de firewall PostgreSQL:" -ForegroundColor Yellow
az postgres flexible-server firewall-rule list --resource-group lama-dev-rg --name lama-pg-dev -o table

# 3. Verificar parámetros SSL
Write-Host "`n3. Configuración SSL PostgreSQL:" -ForegroundColor Yellow
az postgres flexible-server parameter show --resource-group lama-dev-rg --server-name lama-pg-dev --name require_secure_transport

# 4. Verificar VNet Integration
Write-Host "`n4. VNet Integration:" -ForegroundColor Yellow
az webapp vnet-integration list --name lama-backend-dev --resource-group lama-dev-rg

# 5. Verificar NSGs
Write-Host "`n5. Network Security Groups:" -ForegroundColor Yellow
az network nsg list --resource-group lama-dev-rg -o table
```

---

## Próximos Pasos Inmediatos

1. **Ejecutar script de diagnóstico** para obtener información completa
2. **Intentar Opción 3** (agregar todas las possibleOutboundIpAddresses)
3. Si no funciona, **implementar Opción 2** (Service Endpoint - más rápido)
4. Para producción, **planificar Opción 1** (Private Link)

