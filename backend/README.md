# Backend - API NestJS

Stack: NestJS + TypeORM + PostgreSQL / Azure SQL + Azure Blob Storage

> Nota CI/CD: Este archivo se modificó para forzar un nuevo run del workflow GitHub Actions tras quitar el filtro de paths.

## Variables de entorno

Crear archivo `.env` en la raíz del backend:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=lama_db

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your_connection_string

# Azure Communication Services (Email)
AZURE_COMMUNICATION_CONNECTION_STRING=your_connection_string

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
```

## Conexión PostgreSQL (Flexible Server)

En Azure PostgreSQL **Flexible Server** el usuario administrador se usa **sin sufijo @servidor**. El patrón `usuario@servidor` pertenece al modelo antiguo (Single Server). Si el valor de `DB_USER` llega con `pgadmin@lama-pg-dev`, el código ahora lo normaliza automáticamente a `pgadmin`.

### Variables requeridas
| Variable     | Descripción |
|--------------|-------------|
| `DB_HOST`    | FQDN del servidor (`*.postgres.database.azure.com`) |
| `DB_PORT`    | Puerto (5432) |
| `DB_USER`    | Usuario admin (ej: `pgadmin`) |
| `DB_PASS`    | Contraseña o referencia Key Vault |
| `DB_NAME`    | Base de datos (ej: `lama_db`) |

Para producción se usan referencias Key Vault: `@Microsoft.KeyVault(SecretUri=https://.../secrets/DB-PASSWORD)`.

Si en logs aparece advertencia `[DB Diagnostics] La referencia de Key Vault ... no se resolvió`, verificar:
1. Identidad administrada (System Assigned) habilitada en la WebApp.
2. Rol **Key Vault Secrets User** asignado a la identidad en el scope del Key Vault.
3. Esperar algunos minutos tras la asignación de rol.

### Script de prueba rápida

Se agregó `src/tools/test-db-connection.ts` para validar la conexión sin levantar toda la aplicación.

Uso local (PowerShell):
```powershell
$env:DB_HOST="localhost"; $env:DB_PORT="5432"; $env:DB_USER="pgadmin"; $env:DB_PASS="<pwd>"; $env:DB_NAME="lama_db"; npm run build; node dist/src/tools/test-db-connection.js
```

Salida esperada:
```
[DB Test] Conexión EXITOSA. Version: PostgreSQL 16.x ...
```

Si falla por contraseña:
```
[DB Test] ERROR de conexión: password authentication failed for user "pgadmin"
```

## Health Checks
`/health` arranca sólo tras inicializar módulos. Si `DISABLE_DB=1` se puede iniciar la app sin conectar a la base para diagnósticos iniciales.

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run start:dev

# Producción
npm run build
npm start
```

## Swagger

Documentación interactiva de la API: `http://localhost:3000/api/docs`

## Seed inicial de roles

```bash
curl -X POST http://localhost:3000/api/roles/seed
```

Esto creará los roles: Presidente, Vicepresidente, Secretario, Tesorero, GerenciaNegocios, MTO, Administrador, CommunityManager, Miembro, Invitado.
