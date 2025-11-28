# 🚀 Deployment Inmediato del Frontend - PASOS SIMPLES

## ⚠️ Situación Actual
- ZIP listo: `deploy-frontend-final.zip` (4.95 MB) ✅
- Frontend responde pero muestra página por defecto de Azure
- Necesita deployment manual vía Portal (método más confiable)

## 📋 PASOS A SEGUIR (5 minutos)

### Paso 1: Abrir Kudu Console
1. Ir a: https://portal.azure.com
2. Buscar: `lama-frontend-dev`
3. En el menú izquierdo → **Development Tools** → **Advanced Tools**
4. Click en **Go →** (se abre nueva pestaña de Kudu)

### Paso 2: Navegar a wwwroot
En la consola de Kudu:
1. Click en **Debug console** → **CMD** (barra superior)
2. Navegar usando los links: `site` → `wwwroot`
3. Verás los archivos actuales (probablemente solo `hostingstart.html`)

### Paso 3: Limpiar directorio
En la misma consola CMD de Kudu, ejecutar:
```cmd
cd D:\home\site\wwwroot
del /Q *.*
```

O simplemente seleccionar todos los archivos y hacer click en el ícono 🗑️ (papelera) de cada uno.

### Paso 4: Subir el ZIP
1. En la misma ventana de Kudu, asegúrate de estar en `/site/wwwroot/`
2. **Arrastrar y soltar** el archivo `deploy-frontend-final.zip` desde tu PC a la ventana del navegador
3. El archivo se subirá y **se extraerá automáticamente**
4. Espera a que termine (verás los archivos extraídos aparecer)

### Paso 5: Verificar archivos
Debes ver:
- ✅ `.next/` (carpeta)
- ✅ `node_modules/` (carpeta)
- ✅ `server.js`
- ✅ `package.json`
- ✅ `.env.production`

### Paso 6: Reiniciar
1. Volver al Portal de Azure → `lama-frontend-dev`
2. Click en **Restart** (botón superior)
3. Esperar 30 segundos

### Paso 7: Verificar
Abrir en navegador: https://lama-frontend-dev.azurewebsites.net

Deberías ver la aplicación L.A.M.A. Medellín (no la página de bienvenida de Azure).

---

## 🔧 Troubleshooting

### Si no se extraen los archivos automáticamente:
1. En Kudu CMD, después de subir el ZIP:
   ```cmd
   cd D:\home\site\wwwroot
   curl -X POST https://lama-frontend-dev.scm.azurewebsites.net/api/zipdeploy -u $WEBSITE_DEPLOYMENT_USERNAME:$WEBSITE_DEPLOYMENT_PASSWORD --data-binary @deploy-frontend-final.zip
   ```

### Si ves error "Cannot find module 'next'":
- Verificar que `node_modules/` esté presente y contenga carpetas
- Si está vacío, el ZIP puede estar corrupto

### Método alternativo - FTP:
Si Kudu no funciona, usar FileZilla:
1. Obtener credenciales FTP desde Portal → `lama-frontend-dev` → **Deployment Center** → **FTPS credentials**
2. Conectar a: `ftps://waws-prod-dm1-159.ftp.azurewebsites.windows.net`
3. Puerto: 990
4. Extraer `deploy-frontend-final.zip` localmente
5. Subir TODOS los archivos extraídos a `/site/wwwroot/`

---

## ✅ Verificación Final

Una vez desplegado, probar:

1. **Página principal**: https://lama-frontend-dev.azurewebsites.net
   - Debe mostrar el sitio de L.A.M.A. Medellín

2. **Login**: https://lama-frontend-dev.azurewebsites.net/login
   - Debe mostrar formulario de login

3. **API Integration**: Abrir DevTools → Network
   - Las llamadas a `https://lama-backend-dev.azurewebsites.net/api` deben funcionar
   - Sin errores CORS

---

## 📍 Ubicación del ZIP

```
C:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation\deploy-frontend-final.zip
```

**Tamaño**: 4.95 MB
**Contenido verificado**: ✅ Listo para deployment

---

## 🎯 Siguiente Paso

Después del deployment exitoso del frontend:
1. Configurar Private Endpoint para PostgreSQL
2. Habilitar DB en backend (`DISABLE_DB=0`)
3. Verificar integración completa

---

**¿Necesitas ayuda?** Puedo guiarte paso a paso si encuentras algún problema.
