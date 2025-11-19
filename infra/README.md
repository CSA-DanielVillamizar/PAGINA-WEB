# Infraestructura Azure (Bicep)

Este directorio contiene la definición inicial de la infraestructura para la Fundación L.A.M.A. Medellín.

## Recursos Incluidos
1. Application Insights (monitorización)
2. Storage Account (blobs, estáticos, evidencia)
3. Key Vault (almacenamiento seguro de secretos)
4. PostgreSQL Flexible Server (base de datos principal)
5. App Service Plan (hosting del backend API NestJS)
6. Web App (backend API)

Opcional futuro: Static Web App o Web App para frontend, CDN, Azure Front Door, Redis Cache.

## Parámetros principales (`main.bicep`)
| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| location | Región Azure | resourceGroup().location |
| environment | Entorno (dev/test/prod) | dev |
| baseName | Prefijo recursos | lama |
| postgresAdminUser | Usuario admin PostgreSQL | pgadmin |
| postgresAdminPassword | Password admin PostgreSQL (secure) | - |
| postgresSkuName | SKU servidor | B_Standard_B1ms |
| postgresTier | Tier | Burstable |
| appServicePlanSkuName | SKU plan | P1v3 |
| appServicePlanSkuTier | Tier plan | PremiumV3 |

## Despliegue Manual (PowerShell)
```powershell
$rg="lama-rg-dev"
$loc="eastus"
az group create -n $rg -l $loc
az deployment group create -g $rg -f infra/main.bicep -p postgresAdminPassword="<PASSWORD_SEGURA>"
```

## Mejores Prácticas Aplicadas
- Key Vault con purge protection habilitado.
- HTTPS Only en Web App.
- Application Insights para telemetría.
- Identidad Administrada (SystemAssigned) en Web App para acceso futuro a Key Vault sin credenciales.
- Nombres únicos para storage usando `uniqueString`.
- TLS mínimo 1.2 en Storage.

## Próximos Pasos
1. Crear secrets en Key Vault: `ENTRA_CLIENT_SECRET`, `JWT_SECRET`, `DB_PASSWORD`.
2. Configurar pipeline CI/CD para inyectar secretos en Web App (Azure DevOps o GitHub Actions + OIDC).
3. Añadir referencia a Key Vault mediante Azure Web App settings (usar `@Microsoft.KeyVault(SecretUri=...)`).
4. Si se agrega Static Web App para frontend, crear archivo `frontend.bicep`.
5. Migrar `synchronize: true` a migraciones TypeORM.

## Variables de Entorno Clave
| Variable | Origen | Uso |
|----------|--------|-----|
| ENTRA_TENANT_ID | Azure AD | MSAL Auth |
| ENTRA_CLIENT_ID | App Registration | MSAL Auth |
| ENTRA_CLIENT_SECRET | Key Vault | MSAL Auth |
| DB_HOST | PostgreSQL | Conexión DB |
| DB_USER | PostgreSQL | Conexión DB |
| DB_PASS | Key Vault | Conexión DB |
| JWT_SECRET | Key Vault | Firmar JWT |

## Seguridad
- Nunca comprometer `postgresAdminPassword` en el repositorio.
- Usar Managed Identity para acceso Key Vault.
- Revisar RBAC del Resource Group (mínimos privilegios).
- Activar diagnósticos y alertas en Application Insights (futuro).

## Limpieza
Para eliminar todos los recursos:
```powershell
az group delete -n lama-rg-dev --yes --no-wait
```
