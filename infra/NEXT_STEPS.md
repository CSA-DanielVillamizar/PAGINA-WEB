# ✅ Infraestructura Azure Simplificada - LISTA PARA CONFIGURAR

## Estado Actual

### ✅ Recursos Azure Desplegados

| Recurso | Nombre | Estado | URL |
|---------|--------|--------|-----|
| Web App | `lama-dev-backend` | ✅ Running | https://lama-dev-backend.azurewebsites.net |
| PostgreSQL | `lama-dev-pg` | ✅ Running | lama-dev-pg.postgres.database.azure.com |
| Storage | `lamadevstorage` | ✅ Running | - |
| App Plan | `lama-dev-plan` | ✅ Running | B1 Linux |

### ✅ Backend Empaquetado

- Ubicación: `backend/deploy-backend.zip`
- Tamaño: 58.55 MB
- Contenido: dist/ + node_modules + package.json + web.config

## 🎯 PRÓXIMOS PASOS (Configuración Manual)

### Paso 1: Configurar Application Settings

**Debido a problemas SSL con Azure CLI, configurar desde el Portal:**

1. **Abrir configuración del Web App:**
   ```
   https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/rg-lama-dev/providers/Microsoft.Web/sites/lama-dev-backend/configuration
   ```

2. **Click en "Application settings"**

3. **Agregar estas variables (click "+ New application setting" para cada una):**

   ```
   NODE_ENV = production
   PORT = 8080
   WEBSITES_PORT = 8080
   WEBSITE_RUN_FROM_PACKAGE = 1
   SCM_DO_BUILD_DURING_DEPLOYMENT = false
   ENABLE_ORYX_BUILD = false
   
   DB_HOST = lama-dev-pg.postgres.database.azure.com
   DB_PORT = 5432
   DB_USERNAME = lamadmin
   DB_PASSWORD = SecurePass123!Z9
   DB_DATABASE = lamadb
   DB_SSL = true
   
   JWT_SECRET = jwt32charsecretkey1234567890abc
   JWT_EXPIRATION = 7d
   
   FRONTEND_URL = http://localhost:5173
   
   FEATURE_BLOB_REQUIRED = false
   FEATURE_EMAIL_REQUIRED = false
   ENABLE_SWAGGER = 0
   WEBSITE_HEALTHCHECK_MAXPINGFAILURES = 10
   AZURE_STORAGE_CONTAINER_NAME = uploads
   ```

4. **Para AZURE_STORAGE_CONNECTION_STRING:**
   - Abrir: https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/rg-lama-dev/providers/Microsoft.Storage/storageAccounts/lamadevstorage/keys
   - Copiar el valor completo de "Connection string" bajo key1
   - Agregarlo como: `AZURE_STORAGE_CONNECTION_STRING = <valor copiado>`

5. **Click "Save" en la parte superior**

6. **Esperar confirmación "Successfully updated web app settings"**

### Paso 2: Desplegar el Backend

1. **Abrir Deployment Center:**
   ```
   https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/rg-lama-dev/providers/Microsoft.Web/sites/lama-dev-backend/vstscd
   ```

2. **Click en "Zip Deploy" (lado izquierdo)**

3. **Subir el archivo:**
   - Browse → Seleccionar `backend\deploy-backend.zip`
   - Click "OK"

4. **Esperar el despliegue (1-3 minutos)**

### Paso 3: Verificar el Despliegue

1. **Health Check:**
   ```
   https://lama-dev-backend.azurewebsites.net/health
   ```
   
   Debería responder:
   ```json
   {
     "status": "ok",
     "service": "lama-backend",
     "uptime": 123.45
   }
   ```

2. **Ver logs en tiempo real:**
   ```
   https://portal.azure.com/#resource/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups/rg-lama-dev/providers/Microsoft.Web/sites/lama-dev-backend/logStream
   ```

3. **Ver Application Insights (si está habilitado):**
   - Portal → lama-dev-backend → Monitoring → Log stream

## 📋 Checklist

- [ ] Configurar 20 App Settings en el Portal
- [ ] Agregar Storage Connection String
- [ ] Click Save en App Settings
- [ ] Subir deploy-backend.zip vía Zip Deploy
- [ ] Verificar /health endpoint responde
- [ ] Verificar logs no tienen errores
- [ ] Probar endpoint de API (ej: /api/health)

## 🐛 Troubleshooting

### Si /health no responde después del deploy:

1. **Ver logs:**
   - Portal → lama-dev-backend → Log stream
   - Buscar errores de inicio

2. **Verificar App Settings:**
   - Portal → Configuration → Application settings
   - Confirmar que todas las 20+ variables existen

3. **Reiniciar Web App:**
   - Portal → lama-dev-backend → Overview → Restart

4. **Verificar cold start:**
   - Primera petición puede tardar 20-30s
   - Refrescar /health cada 5 segundos

### Si hay error de base de datos:

1. **Verificar firewall PostgreSQL:**
   ```
   Portal → lama-dev-pg → Settings → Networking
   Debe tener: "Allow Azure services" = ON
   ```

2. **Verificar credenciales:**
   - DB_HOST = lama-dev-pg.postgres.database.azure.com
   - DB_USERNAME = lamadmin
   - DB_PASSWORD = SecurePass123!Z9

### Si Storage no conecta:

1. **Re-copiar Connection String:**
   - Portal → lamadevstorage → Access keys
   - Copiar nuevamente key1 connection string

2. **Verificar Container:**
   - Portal → lamadevstorage → Containers
   - Debe existir "uploads" (se crea automáticamente)

## 🎉 ¿Qué Sigue Después?

Una vez que /health responda correctamente:

1. **Ejecutar migraciones:**
   ```powershell
   # Conectar a PostgreSQL
   psql -h lama-dev-pg.postgres.database.azure.com -U lamadmin -d lamadb
   
   # O desde el backend (agregar script)
   ```

2. **Configurar frontend:**
   - Actualizar `VITE_API_URL` a https://lama-dev-backend.azurewebsites.net/api
   - Compilar y desplegar frontend

3. **Testing:**
   - Probar login/registro
   - Probar endpoints de vehículos
   - Verificar upload de archivos

## 📞 Soporte

Si tienes problemas:
1. Revisar `DEPLOYMENT_STATUS.md` para más detalles
2. Ejecutar `.\infra\Setup-Manual.ps1` para ver URLs directas
3. Usar Cloud Shell (https://shell.azure.com) para evitar SSL issues
