# Guía de Despliegue Manual en Azure Portal

## ⚠️ Contexto
Debido a problemas de certificados SSL con Azure CLI, necesitas crear los recursos manualmente desde Azure Portal.

---

## 📋 Recursos a Crear

### Resource Group: `lama-foundation-rg`
- **Region**: Central US
- **Estado**: ✅ YA CREADO

---

## 1️⃣ Storage Account

1. Ir a [Azure Portal](https://portal.azure.com)
2. Buscar "Storage accounts" → **Create**
3. Configuración:
   - **Subscription**: Suscripción de Visual Studio Enterprise
   - **Resource group**: `lama-foundation-rg`
   - **Storage account name**: `lamastoragecus` (o cualquier nombre único)
   - **Region**: **(US) Central US**
   - **Performance**: Standard
   - **Redundancy**: Locally-redundant storage (LRS)

4. Pestaña **Advanced**:
   - **Minimum TLS version**: Version 1.2
   - **Allow Blob anonymous access**: ❌ **Disabled**

5. **Review + Create** → **Create**

---

## 2️⃣ Key Vault

1. Buscar "Key vaults" → **Create**
2. Configuración:
   - **Subscription**: Suscripción de Visual Studio Enterprise
   - **Resource group**: `lama-foundation-rg`
   - **Key vault name**: `lama-kv-centralus` (debe ser único globalmente)
   - **Region**: **(US) Central US**
   - **Pricing tier**: Standard

3. Pestaña **Access configuration**:
   - **Permission model**: ✅ **Azure role-based access control (RBAC)**

4. **Review + Create** → **Create**

5. Después de crear, ir al Key Vault:
   - **Access control (IAM)** → **Add role assignment**
   - **Role**: Key Vault Secrets User
   - **Assign access to**: User, group, or service principal
   - **Members**: Buscar tu cuenta `ms-az-danielvillamizar@outlook.com` y añadirla

---

## 3️⃣ Azure Database for PostgreSQL Flexible Server

1. Buscar "Azure Database for PostgreSQL flexible servers" → **Create**
2. Configuración **Basics**:
   - **Subscription**: Suscripción de Visual Studio Enterprise
   - **Resource group**: `lama-foundation-rg`
   - **Server name**: `lama-pg-centralus` (debe ser único globalmente)
   - **Region**: **(US) Central US**
   - **PostgreSQL version**: 16
   - **Workload type**: Development
   - **Compute + storage**: 
     - Click **Configure server**
     - **Compute tier**: Burstable
     - **Compute size**: Standard_B1ms (1 vCore, 2 GiB RAM)
     - **Storage**: 32 GiB
     - **Click Save**
   
3. **Authentication**:
   - **Authentication method**: PostgreSQL authentication only
   - **Admin username**: `pgadmin`
   - **Password**: `LAMAadmin2024!`
   - **Confirm password**: `LAMAadmin2024!`

4. Pestaña **Networking**:
   - **Connectivity method**: Public access (allowed IP addresses)
   - ✅ **Allow public access from any Azure service within Azure to this server**

5. **Review + Create** → **Create**
   - ⏱️ **Esto tarda 5-10 minutos**

6. Después de crear, ir al servidor PostgreSQL:
   - **Databases** (en el menú izquierdo) → **+ Add**
   - **Name**: `lama_db`
   - **Save**

---

## 4️⃣ Microsoft Entra ID - App Registration

1. Ir a **Microsoft Entra ID** (Azure Active Directory)
2. **App registrations** → **+ New registration**
3. Configuración:
   - **Name**: `LAMA Medellin Web App`
   - **Supported account types**: ✅ **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)**
   - **Redirect URI**:
     - Platform: **Web**
     - URI: `http://localhost:5173/auth/callback`

4. **Register**

5. En la página de Overview de la app:
   - **Copiar Application (client) ID** → Guardar como `ENTRA_CLIENT_ID`
   - **Copiar Directory (tenant) ID** → Guardar como `ENTRA_TENANT_ID`

6. **Certificates & secrets** (menú izquierdo):
   - **+ New client secret**
   - **Description**: `Backend API Secret`
   - **Expires**: 24 months
   - **Add**
   - **⚠️ COPIAR INMEDIATAMENTE EL VALUE** → Guardar como `ENTRA_CLIENT_SECRET`
   - (No podrás verlo de nuevo)

7. **Authentication** (menú izquierdo):
   - Verificar que **Supported account types**: Multitenant
   - **Advanced settings**:
     - **Allow public client flows**: ❌ **No**

8. **API permissions** (menú izquierdo):
   - Ya debería tener `User.Read` de Microsoft Graph
   - Si no está, añadirlo:
     - **+ Add a permission** → **Microsoft Graph** → **Delegated permissions** → `User.Read` → **Add permissions**

---

## 5️⃣ Almacenar Secrets en Key Vault

1. Ir al Key Vault `lama-kv-centralus`
2. **Secrets** → **+ Generate/Import**
3. Crear cada uno de estos secrets:

   **Secret 1:**
   - Name: `ENTRA-CLIENT-ID`
   - Value: `<el Application (client) ID que copiaste>`
   - **Create**

   **Secret 2:**
   - Name: `ENTRA-CLIENT-SECRET`
   - Value: `<el Client Secret value que copiaste>`
   - **Create**

   **Secret 3:**
   - Name: `ENTRA-TENANT-ID`
   - Value: `<el Directory (tenant) ID que copiaste>`
   - **Create**

   **Secret 4:**
   - Name: `JWT-SECRET`
   - Value: Genera una cadena aleatoria de 64 caracteres
   - Ejemplo: `8Kf2Jd9Lm3Np7Qr5Ts1Vx4Zy6Bc8De0Fg2Hj4Kl6Mn8Op0Qr2St4Uv6Wx8Yz0Ab2Cd`
   - **Create**

   **Secret 5:**
   - Name: `DB-PASSWORD`
   - Value: `LAMAadmin2024!`
   - **Create**

---

## 6️⃣ Verificar Recursos Creados

Ejecutar en PowerShell (con SSL deshabilitado):

```powershell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1
az resource list -g lama-foundation-rg --query "[].{Name:name, Type:type, Location:location}" -o table
```

Deberías ver:
- ✅ Storage Account (`lamastoragecus`)
- ✅ Key Vault (`lama-kv-centralus`)
- ✅ PostgreSQL Flexible Server (`lama-pg-centralus`)

---

## 7️⃣ Actualizar .env del Backend

Archivo: `backend/.env`

```env
# Database
DB_HOST=lama-pg-centralus.postgres.database.azure.com
DB_PORT=5432
DB_USER=pgadmin
DB_PASS=LAMAadmin2024!
DB_NAME=lama_db

# Microsoft Entra ID
ENTRA_TENANT_ID=<tu-tenant-id>
ENTRA_CLIENT_ID=<tu-client-id>
ENTRA_CLIENT_SECRET=<tu-client-secret>
MULTI_TENANT=true
ALLOWED_EMAIL_DOMAIN=fundacionlamamedellin.org

# JWT
JWT_SECRET=<genera-una-cadena-aleatoria-de-64-chars>
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 8️⃣ Probar Conexión a PostgreSQL

En PowerShell:

```powershell
# Instalar psql si no lo tienes (opcional)
# winget install PostgreSQL.PostgreSQL

$env:PGPASSWORD="LAMAadmin2024!"
psql -h lama-pg-centralus.postgres.database.azure.com -U pgadmin -d lama_db

# Si se conecta, ejecutar:
# \l       # Listar bases de datos
# \q       # Salir
```

---

## 9️⃣ Ejecutar Migraciones

```powershell
cd backend
npm run typeorm:run
```

---

## 🔟 Iniciar Backend

```powershell
cd backend
npm run start:dev
```

Backend disponible en: http://localhost:3000

Swagger docs: http://localhost:3000/api/docs

---

## ✅ Checklist Final

- [ ] Resource Group creado en Central US
- [ ] Storage Account creado
- [ ] Key Vault creado con RBAC
- [ ] PostgreSQL Flexible Server creado
- [ ] Base de datos `lama_db` creada
- [ ] Firewall de PostgreSQL configurado para Azure services
- [ ] App Registration creada en Entra ID (Multitenant)
- [ ] Client Secret generado y copiado
- [ ] 5 secrets almacenados en Key Vault
- [ ] `.env` del backend actualizado
- [ ] Conexión a PostgreSQL verificada
- [ ] Migraciones ejecutadas
- [ ] Backend iniciado correctamente

---

## 📚 Próximos Pasos

1. **Desplegar Backend a Azure**:
   - Ver: `DEPLOYMENT_GUIDE.md`
   - Opciones: Container Instances, App Service (con cuota aumentada), Azure Container Apps

2. **Configurar Frontend**:
   - Actualizar `.env` con URLs de producción
   - Desplegar a Azure Static Web Apps o App Service

3. **Configurar CI/CD**:
   - GitHub Actions workflow ya está en `.github/workflows/deploy-backend.yml`
   - Configurar secreto `AZURE_CREDENTIALS` en GitHub

---

## 🆘 Soporte

Si tienes problemas:
1. Revisar logs del backend: `npm run start:dev` (modo verbose)
2. Verificar firewall de PostgreSQL incluye tu IP
3. Verificar roles RBAC en Key Vault
4. Consultar `MSAL_MULTI_TENANT_GUIDE.md` para auth issues

