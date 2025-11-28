# Deployment Manual del Frontend Next.js

## Estado Actual

✅ **Backend**: Desplegado y funcional en `https://lama-backend-dev.azurewebsites.net`
- Health endpoint: ✅ 200 OK
- Swagger docs: ✅ Accesible
- CORS configurado para: `https://lama-frontend-dev.azurewebsites.net`

✅ **Frontend Web App**: Desplegado y funcional en `https://lama-frontend-dev.azurewebsites.net`
- App Service Plan: `lama-asp-dev` (Standard S1, compartido con backend)
- Runtime: Node.js 24 LTS
- Startup command configurado: `node server.js`
- ✅ Respondiendo 200 OK con la aplicación Next.js

## Archivos Preparados

📦 **deploy-frontend-fixed.zip** (5.35 MB) ✅ LISTO PARA USAR
- Ubicación: `c:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation\deploy-frontend-fixed.zip`
- Contenido: Build standalone completo de Next.js 14.1.0 con estructura correcta
- Incluye: server.js, .next/, node_modules/ (15 paquetes), package.json, .env.production
- **Empaquetado con `tar.exe` para usar separadores POSIX (/) en lugar de backslashes (\\)**
- ⚠️ **Importante**: No usar `Compress-Archive` de PowerShell, causa errores "Invalid argument (22)" en rsync de Kudu

## Opción 1: Deployment desde Azure Portal (Recomendado)

### Paso 1: Acceder a Kudu Console
1. Ir a Azure Portal → `lama-frontend-dev` Web App
2. En el menú lateral, buscar **Advanced Tools** (Herramientas avanzadas)
3. Click en **Go** → Se abre Kudu Console

### Paso 2: Limpiar directorio wwwroot
```bash
cd site/wwwroot
rm -rf *
```

### Paso 3: Subir y extraer ZIP
En Kudu Console:
1. Click en **Tools** → **Zip Push Deploy**
2. O usar la pestaña **Debug Console** → **CMD**
3. Navegar a `/site/wwwroot`
4. Arrastrar y soltar `deploy-frontend-final.zip` en la ventana del navegador
5. Kudu extraerá automáticamente el ZIP

### Paso 4: Verificar archivos
```bash
ls -la
# Debe mostrar: server.js, package.json, .next/, node_modules/, .env.production
```

### Paso 5: Reiniciar App Service
```bash
# Desde Azure Portal
lama-frontend-dev → Overview → Restart
```

### Paso 6: Verificar
```powershell
Invoke-WebRequest -Uri https://lama-frontend-dev.azurewebsites.net
```

## Opción 4: Script PowerShell (ZipDeploy automático)

Usa el script listo para subir el ZIP usando tu Publish Profile (Kudu):

```powershell
# 1) Ajusta rutas si es necesario y ejecuta
.\infra\\scripts\\Deploy-Frontend-ZipDeploy.ps1 `
  -ZipPath "C:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation\deploy-frontend-final.zip" `
  -PublishSettingsPath "C:\Users\DanielVillamizar\Downloads\lama-frontend-dev.PublishSettings"

# 2) (Opcional) Reinicia desde el Portal tras el despliegue
# Azure Portal → lama-frontend-dev → Restart

# 3) Verifica que carga el sitio
Invoke-WebRequest -Uri https://lama-frontend-dev.azurewebsites.net -TimeoutSec 20
```

Notas:
- El script limpia `/site/wwwroot`, sube el ZIP a `ZipDeploy`, monitorea `deployments/latest` y valida archivos críticos.
- Si ves que falta `server.js`, `.next/` o `node_modules/`, revisa el ZIP fuente.

## Opción 5: Kudu Zip API (Método Probado ✅)

**Este método funcionó exitosamente** cuando ZipDeploy falló con errores de rsync.

### Paso 1: Preparar ZIP con separadores correctos

```powershell
# Genera deploy-frontend-fixed.zip con tar.exe (separadores POSIX)
.\infra\scripts\Prepare-Frontend-Zip.ps1 `
  -FrontendPath "C:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation\frontend-next" `
  -OutputZip "C:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation\deploy-frontend-fixed.zip"
```

### Paso 2: Desplegar usando Kudu Zip API

```powershell
# Cargar Publish Profile
$pp = [xml](Get-Content "C:\Users\DanielVillamizar\Downloads\lama-frontend-dev.PublishSettings")
$prof = $pp.publishData.publishProfile | Where-Object { $_.publishMethod -in 'ZipDeploy','MSDeploy' } | Select-Object -First 1
$pair = "$($prof.userName):$($prof.userPWD)"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$h = @{ Authorization = "Basic $basic"; 'If-Match'='*' }
$khost = ($prof.publishUrl -replace ':443','')

# Subir y extraer ZIP directamente en /site/wwwroot
$u = "https://$khost/api/zip/site/wwwroot"
Invoke-RestMethod -Uri $u -Method PUT -Headers $h `
  -InFile "C:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation\deploy-frontend-fixed.zip" `
  -TimeoutSec 1800
```

### Paso 3: Verificar y reiniciar

```powershell
# Listar archivos en wwwroot
$u = "https://$khost/api/vfs/site/wwwroot/"
(Invoke-RestMethod -Uri $u -Headers @{ Authorization = "Basic $basic" } -TimeoutSec 30) | Select-Object name,mime

# Esperar y verificar sitio
Start-Sleep -Seconds 10
Invoke-WebRequest -Uri https://lama-frontend-dev.azurewebsites.net -TimeoutSec 30
```

**Ventajas**:
- Evita el rsync que falla con backslashes de Windows
- Extracción directa en `wwwroot` sin pasar por el deployer
- Timeout largo (1800s) para manejar archivos grandes

**Cuándo usar**: Si `ZipDeploy` API falla con errores de rsync "Invalid argument (22)", usa este método.

## Opción 2: Deployment mediante FTP

### Credenciales FTP
```powershell
# Obtener credenciales
az webapp deployment list-publishing-credentials `
  --name lama-frontend-dev `
  --resource-group lama-dev-rg `
  --query "{username:publishingUserName, password:publishingPassword}" -o json
```

### Conexión FTP
- Host: `ftps://waws-prod-dm1-159.ftp.azurewebsites.windows.net`
- Puerto: 990 (FTPS)
- Usuario: (obtenido del comando anterior)
- Password: (obtenido del comando anterior)
- Directorio destino: `/site/wwwroot`

### Pasos:
1. Conectar con FileZilla o WinSCP
2. Navegar a `/site/wwwroot`
3. Eliminar archivos existentes
4. Extraer localmente `deploy-frontend-standalone.zip`
5. Subir todos los archivos extraídos al directorio remoto
6. Reiniciar App Service desde Portal

## Opción 3: Deployment mediante GitHub Actions (Producción)

### Configurar GitHub Actions
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend-next/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
          
      - name: Build Next.js
        run: |
          cd frontend-next
          npm ci
          npm run build
          
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: lama-frontend-dev
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: frontend-next/.next/standalone
```

### Obtener Publish Profile
```powershell
az webapp deployment list-publishing-profiles `
  --name lama-frontend-dev `
  --resource-group lama-dev-rg `
  --xml | Out-File publish-profile.xml
```

Agregar contenido como secret `AZURE_WEBAPP_PUBLISH_PROFILE` en GitHub.

## Configuración del Frontend

### Variables de entorno ya configuradas
```bash
NEXT_PUBLIC_API_BASE=https://lama-backend-dev.azurewebsites.net/api
NODE_ENV=production
WEBSITE_NODE_DEFAULT_VERSION=~24
SCM_DO_BUILD_DURING_DEPLOYMENT=false
WEBSITE_RUN_FROM_PACKAGE=0
```

### Startup command configurado
```bash
node server.js
```

## Verificación Post-Deployment

### 1. Verificar salud del sitio
```powershell
Invoke-WebRequest -Uri https://lama-frontend-dev.azurewebsites.net -Method Get
```

### 2. Verificar logs
```powershell
az webapp log tail --name lama-frontend-dev --resource-group lama-dev-rg
```

### 3. Probar autenticación
1. Abrir `https://lama-frontend-dev.azurewebsites.net/login`
2. Intentar login (backend debe responder con CORS correcto)
3. Verificar en DevTools que las llamadas al API funcionan

## Siguiente Paso: Private Endpoint para PostgreSQL

Una vez el frontend esté operativo, completar el Private Endpoint para conectar el backend a PostgreSQL:

1. Azure Portal → `lama-pg-dev` PostgreSQL Server
2. Networking → Private access
3. Create private endpoint:
   - Name: `lama-pg-private-endpoint`
   - Resource group: `lama-dev-rg`
   - Region: Central US
   - VNet: `lama-vnet`
   - Subnet: `postgres-subnet` (10.0.2.0/24)
   - Integrate with private DNS zone: **YES**
4. Después de crear:
   ```powershell
   az webapp config appsettings set `
     --name lama-backend-dev `
     --resource-group lama-dev-rg `
     --settings DISABLE_DB=0
   
   az webapp restart --name lama-backend-dev --resource-group lama-dev-rg
   ```

## Troubleshooting

### Frontend no responde (timeout)
```powershell
# Ver logs en tiempo real
az webapp log tail --name lama-frontend-dev --resource-group lama-dev-rg

# Verificar proceso Node.js está corriendo
# En Kudu Console:
ps aux | grep node
```

### Error "Cannot find module"
- Verificar que `node_modules/` esté presente en wwwroot
- Verificar que `server.js` esté en la raíz de wwwroot

### CORS errors desde frontend
- Verificar que FRONTEND_URL en backend coincida con URL del frontend
- Verificar que backend esté respondiendo (health endpoint)

## Resumen

**Estado actual**: Frontend desplegado exitosamente usando **Opción 5** (Kudu Zip API).

**Recursos**:
- Backend: https://lama-backend-dev.azurewebsites.net ✅ Funcional
- Frontend: https://lama-frontend-dev.azurewebsites.net ✅ Funcional (200 OK)
- PostgreSQL: lama-pg-dev.postgres.database.azure.com ⚠️ (pendiente Private Endpoint)

**Próximo paso**: Configurar Private Endpoint para PostgreSQL y habilitar conexión de base de datos en backend.
