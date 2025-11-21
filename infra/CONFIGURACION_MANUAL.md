# 🔧 Configuración Manual de Servicios Externos

## ⚠️ Azure CLI con problemas - Usar Portal Azure

El Azure CLI tiene errores de SSL/extensiones. Sigue estos pasos en el Portal:

---

## 📋 Paso 1: Crear Secretos en Key Vault

1. Ve a **Portal Azure** → `lama-kv-dev99`
2. En el menú izquierdo: **Secrets**
3. Click **+ Generate/Import**

### Secreto 1: `acs-email-conn`
- **Name**: `acs-email-conn`
- **Secret value**:
```
endpoint=https://lama-comm-dev.unitedstates.communication.azure.com/;accesskey=B7GdAfiKj9MAq2sFlx6zoam34JowyKTolSoRNwae1MkD80XfM2m6JQQJ99BKACULyCpQg5bdAAAAAZCSk6tR
```
- Click **Create**

### Secreto 2: `email-sender`
- **Name**: `email-sender`
- **Secret value**: `no-reply@fundacionlamamedellin.org`
- Click **Create**

### Verificar Secreto Existente: `storage-conn`
- Debe estar ya creado con el connection string de Storage Account
- Si no existe, crear con el valor:
```
DefaultEndpointsProtocol=https;AccountName=lamastoragedev99;AccountKey=rloAJtgLxXyjzglnMWdCftUh1khLRzoMJ9hfD+jXatvB6hwLZC38CkupKQlFacccEk2tOE9KbxTT+ASth4QK3g==;EndpointSuffix=core.windows.net
```

---

## 📋 Paso 2: Obtener URIs de Secretos

Para cada secreto (`storage-conn`, `acs-email-conn`, `email-sender`):

1. Click en el secreto
2. Click en la **versión actual** (GUID)
3. Copia el **Secret Identifier** (formato: `https://lama-kv-dev99.vault.azure.net/secrets/NOMBRE/GUID`)

**Ejemplo**:
```
https://lama-kv-dev99.vault.azure.net/secrets/storage-conn/011698f757e54c1a81b3bddd0006609c
https://lama-kv-dev99.vault.azure.net/secrets/acs-email-conn/2a3a18f6198748cca863cfc74a496eea
https://lama-kv-dev99.vault.azure.net/secrets/email-sender/48d76acf46b547729e5d8414fe903dc9

```

---

## 📋 Paso 3: Configurar App Settings en App Service

1. Ve a **Portal Azure** → `lama-backend-dev` (App Service)
2. En el menú izquierdo: **Configuration**
3. En la pestaña **Application settings**, click **+ New application setting**

### Agregar estos settings (uno por uno):

#### Setting 1: AZURE_STORAGE_CONNECTION_STRING
- **Name**: `AZURE_STORAGE_CONNECTION_STRING`
- **Value**: `@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/storage-conn/011698f757e54c1a81b3bddd0006609c)`
  - ⚠️ Reemplaza `VERSION_GUID` con el GUID real del paso 2

#### Setting 2: AZURE_COMMUNICATION_CONNECTION_STRING
- **Name**: `AZURE_COMMUNICATION_CONNECTION_STRING`
- **Value**: `@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/acs-email-conn/2a3a18f6198748cca863cfc74a496eea)`
  - ⚠️ Reemplaza `VERSION_GUID` con el GUID real del paso 2

#### Setting 3: EMAIL_SENDER_ADDRESS
- **Name**: `EMAIL_SENDER_ADDRESS`
- **Value**: `@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/email-sender/48d76acf46b547729e5d8414fe903dc9)`
  - ⚠️ Reemplaza `VERSION_GUID` con el GUID real del paso 2

#### Setting 4: FEATURE_BLOB_REQUIRED
- **Name**: `FEATURE_BLOB_REQUIRED`
- **Value**: `true`

#### Setting 5: FEATURE_EMAIL_REQUIRED
- **Name**: `FEATURE_EMAIL_REQUIRED`
- **Value**: `false`

4. Click **Save** en la parte superior
5. Click **Continue** en el diálogo de confirmación

---

## 📋 Paso 4: Verificar Managed Identity

1. En `lama-backend-dev` → **Identity**
2. Pestaña **System assigned**
3. Verifica que **Status** = **On**
4. Copia el **Object (principal) ID**

---

## 📋 Paso 5: Dar Permisos en Key Vault

1. Ve a `lama-kv-dev99`
2. En el menú izquierdo: **Access policies**
3. Click **+ Create**
4. En **Secret permissions**, selecciona: **Get**, **List**
5. Click **Next**
6. En **Principal**, busca por el **Object ID** del paso 4
7. Selecciona la identidad de `lama-backend-dev`
8. Click **Next** → **Next** → **Create**

---

## 📋 Paso 6: Reiniciar App Service

1. En `lama-backend-dev` → **Overview**
2. Click **Restart** en la barra superior
3. Click **Yes** en el diálogo de confirmación
4. Espera **45-60 segundos** para inicialización completa

---

## ✅ Paso 7: Validar Servicios

Ejecuta en PowerShell:

```powershell
# Test Health
Invoke-RestMethod https://lama-backend-dev.azurewebsites.net/api/health

# Test Blob Storage (con upload de prueba)
Invoke-RestMethod https://lama-backend-dev.azurewebsites.net/api/diagnostics/blob?testUpload=true

# Test Email Service
Invoke-RestMethod https://lama-backend-dev.azurewebsites.net/api/diagnostics/email
```

### Respuestas Esperadas:

**Health** (debe retornar 200 OK):
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

**Blob Diagnostics** (debe retornar 200 OK):
```json
{
  "service": "Azure Blob Storage",
  "enabled": true,
  "containerName": "uploads",
  "accountName": "lamastoragedev99"
}
```

**Email Diagnostics** (debe retornar 200 OK):
```json
{
  "service": "Azure Communication Services Email",
  "enabled": true,
  "senderAddress": "no-reply@fundacionlama.org"
}
```

---

## 🔍 Troubleshooting

### Si Blob/Email aparece `enabled: false`:

1. Verifica que los App Settings usen sintaxis correcta: `@Microsoft.KeyVault(SecretUri=...)`
2. Verifica que el URI incluya el **GUID de versión** al final
3. Verifica permisos de Managed Identity en Key Vault
4. Revisa logs: Portal → App Service → **Log stream**

### Si aparece error 401/403:

- Falta permiso **Get** en Access Policy de Key Vault
- Vuelve al **Paso 5** y verifica que la identidad tenga permisos

### Si aparece error de connection string inválida:

- Copia/pega los valores completos sin espacios ni saltos de línea
- El formato ACS debe ser: `endpoint=https://...;accesskey=...`
- El formato Storage debe ser: `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=...`

---

## 📊 Estado Final Esperado

```
✅ Base de datos: 12 tablas creadas (migraciones aplicadas)
✅ Blob Storage: Configurado y funcionando
✅ Email Service: Configurado (modo optional)
✅ Key Vault: 3 secretos creados
✅ App Service: Referencias a Key Vault activas
✅ Managed Identity: Permisos configurados
```

---

## 🎯 Próximos Pasos

Una vez validados los servicios:

1. **Habilitar email requerido** (cambiar `FEATURE_EMAIL_REQUIRED` a `true`)
2. **Configurar dominio email** en Azure Communication Services
3. **Probar flujos completos**: registro de usuario, formularios, donaciones
4. **Configurar alertas** en Azure Monitor

---

## 📞 Notas Importantes

- Los Key Vault references solo funcionan con **Managed Identity habilitada**
- Los secretos se actualizan automáticamente cuando cambias la versión en Key Vault
- **No incluir** connection strings directamente en App Settings (siempre usar Key Vault)
- El formato `@Microsoft.KeyVault(SecretUri=...)` es case-sensitive
