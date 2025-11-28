# 🗄️ Instrucciones para Ejecutar Migraciones en Azure

## 📊 Estado Actual

### ✅ Completado
- **Commit**: `90cc62f` - 64 archivos modificados, 3,439 inserciones
- **Push**: Exitoso a `origin/main`
- **Deployment**: GitHub Actions workflow completado en 4m7s
- **Código**: Desplegado a Azure App Service `lama-backend-dev`

### ⚠️ Pendiente
- **Migraciones**: 8 migraciones TypeORM necesitan ejecutarse en la base de datos PostgreSQL
- **Problema Actual**: App Service retorna `503 Server Unavailable`
  - Posible causa: Restart prolongado post-deployment
  - Necesita intervención manual

---

## 🔧 Métodos para Ejecutar las Migraciones

### Opción 1: Azure Portal - SSH al App Service (RECOMENDADO)

1. **Acceder a Azure Portal**:
   ```
   https://portal.azure.com
   ```

2. **Navegar al App Service**:
   - Resource Group: `lama-foundation-rg`
   - App Service: `lama-backend-dev`

3. **Abrir SSH**:
   - En el menú lateral: `Development Tools` → `SSH`
   - O `Advanced Tools` → `Go` → `SSH`

4. **Ejecutar comandos**:
   ```bash
   cd /home/site/wwwroot
   
   # Verificar que el código está actualizado
   ls -la src/migrations/
   
   # Debería mostrar:
   # 1700000001000-AuthTokens.ts
   # 1700000002000-VehicleEnhancements.ts
   # 1700000003000-EventEnhancements.ts
   # 1700000004000-DonationEnhancements.ts
   # 1700000005000-GalleryEnhancements.ts
   # 1700000006000-NewsEnhancements.ts
   # 1700000007000-SubscriptionEnhancements.ts
   # 1700000008000-SouvenirEnhancements.ts
   
   # Ejecutar migraciones
   npm run migration:run
   
   # O directamente con TypeORM
   npx typeorm migration:run -d dist/data-source.js
   ```

5. **Verificar resultado**:
   - Debería mostrar: `8 migrations are already loaded in the database. Successfully ran N migrations`
   - Si muestra "0 migrations are pending", las migraciones ya se ejecutaron

---

### Opción 2: Endpoint HTTP (cuando el servicio responda)

**Prerrequisitos**: App Service debe estar respondiendo (status 200)

```powershell
# Verificar salud primero
Invoke-RestMethod -Uri "https://lama-backend-dev.azurewebsites.net/health" -Method GET

# Ejecutar migraciones
$response = Invoke-RestMethod `
  -Uri "https://lama-backend-dev.azurewebsites.net/api/admin/run-migrations" `
  -Method POST `
  -TimeoutSec 180

# Ver resultado
$response | ConvertTo-Json -Depth 5
```

---

### Opción 3: Azure CLI Cloud Shell

1. **Abrir Cloud Shell**:
   ```
   https://shell.azure.com
   ```

2. **Ejecutar comando remoto**:
   ```bash
   az webapp ssh --name lama-backend-dev --resource-group lama-foundation-rg --timeout 600
   
   # Luego dentro del SSH:
   cd /home/site/wwwroot
   npm run migration:run
   ```

---

### Opción 4: Conexión Directa a PostgreSQL

Si el backend no responde pero la DB sí:

1. **Obtener connection string**:
   - Azure Portal → PostgreSQL server → Connection strings
   - O desde Key Vault: `PostgresConnectionString`

2. **Conectar con psql o Azure Data Studio**:
   ```bash
   psql "postgresql://pgadmin@lama-pg-foundation:LAMAadmin2024!@lama-pg-foundation.postgres.database.azure.com:5432/fundaciondb?sslmode=require"
   ```

3. **Verificar migraciones aplicadas**:
   ```sql
   SELECT * FROM typeorm_metadata ORDER BY timestamp DESC;
   -- O
   SELECT * FROM migrations ORDER BY id DESC;
   ```

4. **Si no hay migraciones**, ejecutar localmente apuntando a producción:
   ```bash
   # En tu máquina local:
   cd backend
   
   # Modificar temporalmente .env para apuntar a producción
   DATABASE_URL="postgresql://pgadmin@lama-pg-foundation:LAMAadmin2024!@lama-pg-foundation.postgres.database.azure.com:5432/fundaciondb?sslmode=require"
   
   # Ejecutar migraciones
   npm run migration:run
   
   # IMPORTANTE: Revertir .env después
   ```

---

## 🔍 Diagnóstico del Problema 503

### Posibles Causas

1. **Restart Prolongado**: El App Service puede tardar 5-10 minutos en reiniciar después de un deployment grande
2. **Startup Command Fallando**: Verifica en `Deployment Center` → `Logs`
3. **Variables de Entorno Faltantes**: Verifica en `Configuration` → `Application Settings`
4. **Health Check Fallando**: Verifica en `Health check` settings
5. **Plan de App Service Saturado**: Free/Basic tier puede tener limitaciones

### Comandos de Diagnóstico

```powershell
# Ver logs en tiempo real
az webapp log tail --name lama-backend-dev --resource-group lama-foundation-rg

# Verificar configuración
az webapp config show --name lama-backend-dev --resource-group lama-foundation-rg

# Reiniciar manualmente
az webapp restart --name lama-backend-dev --resource-group lama-foundation-rg

# Verificar deployment slots
az webapp deployment source show --name lama-backend-dev --resource-group lama-foundation-rg
```

---

## 📋 Lista de las 8 Migraciones

| # | Timestamp | Nombre | Tabla | Descripción |
|---|-----------|--------|-------|-------------|
| 1 | `1700000001000` | AuthTokens | `refresh_tokens`, `password_reset_tokens`, `email_confirmation_tokens` | Tokens de autenticación |
| 2 | `1700000002000` | VehicleEnhancements | `vehicles` | ownerUserId, ownershipHistory, images |
| 3 | `1700000003000` | EventEnhancements | `events` | coverImageUrl, registrations, reminders |
| 4 | `1700000004000` | DonationEnhancements | `donations` | paymentInfo, receiptUrl, receiptNumber |
| 5 | `1700000005000` | GalleryEnhancements | `gallery` | thumbnailUrl, metadata, timestamps |
| 6 | `1700000006000` | NewsEnhancements | `news` | featuredImageUrl, tags, viewCount |
| 7 | `1700000007000` | SubscriptionEnhancements | `subscriptions` | confirmToken, unsubscribeToken |
| 8 | `1700000008000` | SouvenirEnhancements | `souvenirs` | inventory, transactions |

---

## ✅ Verificación Post-Migraciones

Una vez ejecutadas, verificar:

### 1. Base de Datos
```sql
-- Verificar tabla de migraciones TypeORM
SELECT * FROM typeorm_metadata ORDER BY timestamp DESC LIMIT 10;

-- Verificar columnas nuevas en donations
\d donations

-- Verificar columnas JSONB en souvenirs
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'souvenirs' AND column_name IN ('inventory', 'transactions');
```

### 2. API Endpoints

```powershell
# Health check
Invoke-RestMethod "https://lama-backend-dev.azurewebsites.net/health"

# Stats endpoints (verificar que funcionan)
Invoke-RestMethod "https://lama-backend-dev.azurewebsites.net/api/donations/stats"
Invoke-RestMethod "https://lama-backend-dev.azurewebsites.net/api/gallery/stats"
Invoke-RestMethod "https://lama-backend-dev.azurewebsites.net/api/news/stats"
Invoke-RestMethod "https://lama-backend-dev.azurewebsites.net/api/subscriptions/stats"
Invoke-RestMethod "https://lama-backend-dev.azurewebsites.net/api/souvenirs/stats"
```

### 3. Funcionalidades Nuevas

Probar endpoints clave:
- **Donations**: `POST /api/donations/:id/receipt` - Generar PDF
- **Gallery**: `POST /api/gallery/:id/images/bulk` - Upload múltiple
- **News**: `POST /api/news/:id/publish` - Workflow publicación
- **Subscriptions**: `POST /api/subscriptions/confirm/:token` - Confirmación
- **Souvenirs**: `POST /api/souvenirs/:id/inventory-adjust` - Ajuste inventario

---

## 🆘 Solución Rápida si el Servicio No Responde

1. **Reiniciar el App Service manualmente** desde Azure Portal
2. **Esperar 5 minutos** para que complete el start
3. **Verificar logs** en `Log stream` para ver errores de startup
4. **Revisar Application Insights** para excepciones no manejadas
5. **Verificar connection string PostgreSQL** en Configuration
6. **Revisar que `DATABASE_URL`** en App Settings apunta a la DB correcta

---

## 📞 Contacto para Soporte

Si los métodos anteriores no funcionan:
- **Azure Portal**: Soporte técnico desde el portal
- **Logs del Servicio**: `lama-backend-dev` → `Diagnose and solve problems`
- **Application Insights**: Buscar excepciones en los últimos 30 minutos

---

**Última Actualización**: 21 de noviembre de 2025  
**Estado del Deployment**: ✅ Código desplegado, ⚠️ Migraciones pendientes  
**Próximo Paso**: Ejecutar migraciones usando **Opción 1 (SSH)** (previo FIX de `node_modules`)

---

## 🧩 Reparación de `node_modules` en Azure App Service (Cuando aparece `Cannot find module 'reflect-metadata'`)

Esto sucede porque el build empaqueta dependencias en `node_modules.tar.gz` y deja un symlink `node_modules -> /node_modules` vacío. Para que TypeORM y Nest carguen correctamente:

### Pasos
```bash
cd /home/site/wwwroot
# 1. Eliminar el symlink existente
rm -f node_modules
# 2. Crear carpeta real
mkdir node_modules
# 3. Ver estructura interna del tar (confirma que NO tiene prefijo node_modules/)
tar -tzf node_modules.tar.gz | head -10
# 4. Extraer paquetes dentro de la carpeta
tar -xzf node_modules.tar.gz -C node_modules
# 5. Verificar dependencias críticas
ls node_modules/reflect-metadata || echo 'Falta reflect-metadata'
ls node_modules/typeorm || echo 'Falta typeorm'
# 6. Ejecutar migraciones (CLI local)
npm run migration:run
```

### Si aún falta algún módulo
```bash
# Instalación de sólo producción (rápida)
npm ci --only=production
npm run migration:run
```

### Logs esperados
- Mensajes `[Migration Runner] Conexión establecida...`
- Queries `ALTER TABLE ...` para cada migración
- Final: `✓ Migraciones aplicadas correctamente.`

### Verificación rápida post migración
```bash
node -e "const { AppDataSource } = require('./dist/data-source');(async()=>{await AppDataSource.initialize();const r=await AppDataSource.query('SELECT timestamp, name FROM migrations ORDER BY timestamp DESC');console.log(r);await AppDataSource.destroy();})();"
```

Si devuelve las 8 nuevas migraciones (además de la inicial) el proceso terminó correctamente.

---

