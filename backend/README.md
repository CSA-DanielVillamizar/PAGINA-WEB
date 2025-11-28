# Backend - API NestJS

Stack: NestJS + TypeORM + PostgreSQL / Azure SQL + Azure Blob Storage
## Despliegue a Azure App Service (Local Git)

Scripts agregados:
1. `deploy-local-git.ps1` (PowerShell local / Windows)
2. `deploy-cloudshell.sh` (Bash para Azure Cloud Shell)

### Requisitos previos
 - App Service creado y App Settings configurados (DB_HOST, DB_NAME, DB_USER, DB_PASS, NODE_ENV=production, PORT=8080, WEBSITE_STARTUP_FILE, SCM_DO_BUILD_DURING_DEPLOYMENT=true).
 - Basic Auth habilitado en Deployment Center.
 - Paquete sin `node_modules` en repositorio (Oryx los instalará).

### Uso rápido (Cloud Shell recomendado)
# Backend - API NestJS

Stack: NestJS + TypeORM + PostgreSQL / Azure SQL + Azure Blob Storage

## Despliegue Automatizado (GitHub Actions)

Workflow: `.github/workflows/backend-deploy.yml`

### Flujo

1. Ejecuta CI al hacer push sobre `main` que afecte `backend/**` o manual (`workflow_dispatch`).
2. `npm ci` instala dependencias limpias.
3. `npm run build` compila TypeScript a `dist/`.
4. Se elimina `node_modules` para que Oryx reinstale en Azure (evita arrastrar dependencias inconsistentes).
5. Se empaqueta como `backend-artifact.zip` y se despliega vía Publish Profile.
6. Health check sobre `/health` (10 reintentos).

### Configuración requerida

1. Portal Azure > WebApp `lama-dev-backend` > `Get Publish Profile` (descargar XML).
2. GitHub Repo > Settings > Secrets and variables > Actions > New secret:
	- Nombre: `AZURE_WEBAPP_PUBLISH_PROFILE`
	- Valor: Contenido completo del XML.
3. App Settings mínimos (Portal Azure > Configuration):

```
DB_HOST=lama-dev-pg.postgres.database.azure.com
DB_PORT=5432
DB_NAME=lama_db
DB_USER=pgadmin@lama-dev-pg
DB_PASS=<secreto>
DB_SSL=1
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://lama-dev-frontend.azurewebsites.net
JWT_SECRET=<secreto>
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_NODE_DEFAULT_VERSION=~20
WEBSITE_STARTUP_FILE=node dist/main.js
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10
ENABLE_SWAGGER=0
DISABLE_DB=0
```

### Despliegue manual de workflow

Ir a pestaña **Actions** > seleccionar `Backend Deploy to Azure Web App` > `Run workflow`.

### Troubleshooting rápido

- Build falla: revisar logs Kudu `https://lama-dev-backend.scm.azurewebsites.net/`.
- `/health` 503: confirmar App Settings y ver `az webapp log tail`.
- Credenciales inválidas: regenerar Publish Profile y actualizar secreto.
- Dependencias no instaladas: verificar que no existe `WEBSITE_RUN_FROM_PACKAGE` residual.

### Local Git (alternativa manual)

Scripts aún disponibles:

- `deploy-local-git.ps1` (PowerShell)
- `deploy-cloudshell.sh` (Cloud Shell Bash)

Uso rápido (Cloud Shell):

```bash
cd backend
bash deploy-cloudshell.sh lama-dev-backend rg-lama-dev
```

### Migraciones (manual en contenedor)

```bash
az webapp ssh -g rg-lama-dev -n lama-dev-backend
npm run migration:run
exit
```

### Seguridad

No subir secretos (contraseñas DB, JWT_SECRET) al repositorio. Preferir referencias Key Vault.
	- `WEBSITE_NODE_DEFAULT_VERSION=~20`
	- `WEBSITE_STARTUP_FILE=node dist/main.js`
	- `NODE_ENV=production`, `PORT=8080`

### Despliegue manual
Ir a pestaña **Actions** > seleccionar workflow > **Run workflow**.

### Troubleshooting rápido
- Build falla: Revisar logs Kudu `https://lama-dev-backend.scm.azurewebsites.net/`.
- `/health` 503: Confirmar App Settings, revisar `az webapp log tail`.
- Credenciales inválidas: Regenerar Publish Profile y actualizar secreto.

### App Settings mínimas (resumen)
```
DB_HOST=lama-dev-pg.postgres.database.azure.com
DB_PORT=5432
DB_NAME=lama_db
DB_USER=pgadmin@lama-dev-pg
DB_PASS=<secreto>
DB_SSL=1
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://lama-dev-frontend.azurewebsites.net
JWT_SECRET=<secreto>
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_NODE_DEFAULT_VERSION=~20
WEBSITE_STARTUP_FILE=node dist/main.js
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10
ENABLE_SWAGGER=0
DISABLE_DB=0
```

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

# Email Providers (elige uno)
# Opción A) SMTP (Office 365)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false          # false para STARTTLS
SMTP_USER=gerencia@fundacionlamamedellin.org
SMTP_PASS=<NO PONER EN CÓDIGO>
SMTP_FROM=gerencia@fundacionlamamedellin.org

# Opción B) Azure Communication Services (Email)
AZURE_COMMUNICATION_CONNECTION_STRING=your_connection_string
EMAIL_SENDER_ADDRESS=no-reply@fundacionlama.org

# Destinatario de inscripciones
INSCRIPTIONS_RECEIVER=gerencia@fundacionlamamedellin.org

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

## Endpoints de Formularios

- POST `/api/inscriptions/send-email`
  - Envía a `INSCRIPTIONS_RECEIVER` un correo con los datos básicos de la inscripción.
  - Cuerpo (JSON):
    - `fullName: string`, `email: string`, `metadata?: object` (campos adicionales),
    - `pdfBase64?: string`, `pdfFileName?: string` (opcional adjunto PDF Base64).
  - Requiere configurar SMTP o ACS (ver Variables de entorno).

## Configuración de Email

### Desarrollo Local (SMTP Office 365)

**Opción A - Variables de entorno manuales:**
```powershell
cd backend
$env:SMTP_HOST="smtp.office365.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="false"
$env:SMTP_USER="gerencia@fundacionlamamedellin.org"
$env:SMTP_PASS="FLM902007705-8"
$env:SMTP_FROM="gerencia@fundacionlamamedellin.org"
$env:INSCRIPTIONS_RECEIVER="gerencia@fundacionlamamedellin.org"

npm install
npm run start:dev
```

**Opción B - Script automático:**
```powershell
cd backend
.\Setup-Email-Local.ps1 -SmtpPass "FLM902007705-8"
npm run start:dev
```

**Prueba rápida:**
```bash
curl http://localhost:8080/api/diagnostics/email?to=danielvillamizara@gmail.com
```

### Producción Azure (Azure App Service)

**Configurar App Settings con script:**
```powershell
# Configuración directa
.\Setup-Email-Azure.ps1 -ResourceGroup lama-rg -AppServiceName lama-backend -SmtpPass "FLM902007705-8"

# Con Key Vault (recomendado)
.\Setup-Email-Azure.ps1 -ResourceGroup lama-rg -AppServiceName lama-backend -SmtpPass "FLM902007705-8" -KeyVaultName lama-kv
```

**Reiniciar Web App:**
```powershell
az webapp restart -g lama-rg -n lama-backend
```

**Verificar:**
```bash
curl https://lama-backend.azurewebsites.net/api/diagnostics/email?to=danielvillamizara@gmail.com
```

### Notas Office 365 SMTP

- Puerto 587 con STARTTLS (no SSL directo).
- Si tienes MFA, usa "contraseña de aplicación" desde https://account.microsoft.com/security.
- Verifica que SMTP AUTH esté habilitado en el tenant (Exchange Admin Center).
- El `from` debe ser una cuenta autorizada (idealmente la misma que `SMTP_USER`).


## Swagger

Documentación interactiva de la API: `http://localhost:3000/api/docs`

## Seed inicial de roles

```bash
curl -X POST http://localhost:3000/api/roles/seed
```

Esto creará los roles: Presidente, Vicepresidente, Secretario, Tesorero, GerenciaNegocios, MTO, Administrador, CommunityManager, Miembro, Invitado.
#   T r i g g e r   d e p l o y  
 #   D e p l o y   t r i g g e r  
 