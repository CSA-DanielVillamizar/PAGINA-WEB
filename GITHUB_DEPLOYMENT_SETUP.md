# 🚀 Configuración de Despliegue con GitHub Actions

## ✅ **PASO 1: Service Principal Creado**

Se ha creado un Service Principal para GitHub Actions con los siguientes datos:

```json
{
  "clientId": "7b946aa1-8ba3-4d86-8f24-6cd98ea9d1cb",
  "clientSecret": "ZEk8Q~lYzbtBRL1B-eqE8HOImW1bmkfewt1jucLl",
  "subscriptionId": "f301f085-0a60-44df-969a-045b4375d4e7",
  "tenantId": "95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

**⚠️ IMPORTANTE:** Este JSON completo debe agregarse como secret en GitHub.

---

## 📋 **PASO 2: Configurar Secret en GitHub**

### **Opción A: Via Web Interface (Recomendado)**

1. Ve a tu repositorio: https://github.com/CSA-DanielVillamizar/PAGINA-WEB
2. Click en **Settings** (Configuración)
3. En el menú izquierdo, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**
5. Nombre del secret: `AZURE_CREDENTIALS`
6. Valor: Copia y pega el JSON completo de arriba
7. Click en **Add secret**

### **Opción B: Via GitHub CLI**

```bash
# Instalar GitHub CLI si no lo tienes
# https://cli.github.com/

# Autenticarte
gh auth login

# Crear el secret
gh secret set AZURE_CREDENTIALS -R CSA-DanielVillamizar/PAGINA-WEB --body '{
  "clientId": "7b946aa1-8ba3-4d86-8f24-6cd98ea9d1cb",
  "clientSecret": "ZEk8Q~lYzbtBRL1B-eqE8HOImW1bmkfewt1jucLl",
  "subscriptionId": "f301f085-0a60-44df-969a-045b4375d4e7",
  "tenantId": "95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}'
```

---

## 🔧 **PASO 3: Workflow GitHub Actions Actualizado**

El archivo `.github/workflows/deploy-backend.yml` ya está configurado con:

✅ **Nombre correcto del Web App**: `lama-backend-app`  
✅ **Build automático** del backend con TypeScript  
✅ **Creación automática** de `package.json` de producción en `dist/`  
✅ **Despliegue** de la carpeta `dist/` (código compilado)  
✅ **Trigger automático** en push a `main` cuando cambien archivos en `backend/`  

---

## 📤 **PASO 4: Push al Repositorio**

Ejecuta estos comandos en tu terminal:

```powershell
# Navegar al directorio
cd C:\Users\DanielVillamizar\WebPageLAMAMedellinFoundation

# Agregar remote (si aún no está)
git remote add origin https://github.com/CSA-DanielVillamizar/PAGINA-WEB.git

# Verificar archivos a incluir
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: Backend completo con despliegue automático a Azure"

# Configurar upstream y push
git branch -M main
git push -u origin main
```

---

## 🎯 **PASO 5: Verificar Despliegue**

Una vez hagas el push:

1. Ve a: https://github.com/CSA-DanielVillamizar/PAGINA-WEB/actions
2. Verás el workflow **"Deploy Backend to Azure"** ejecutándose
3. Click en el workflow para ver los logs en tiempo real
4. Espera a que termine (aprox. 3-5 minutos)

### **Estados del Workflow:**

- 🟡 **Amarillo (Running)**: Desplegando...
- 🟢 **Verde (Success)**: ¡Despliegue exitoso!
- 🔴 **Rojo (Failed)**: Error (revisar logs)

---

## ✅ **PASO 6: Probar la Aplicación Desplegada**

Una vez el workflow termine exitosamente:

```bash
# Verificar que la app responde
curl https://lama-backend-app.azurewebsites.net

# Ver documentación Swagger
# En navegador:
https://lama-backend-app.azurewebsites.net/api/docs

# Probar endpoint de auth
curl https://lama-backend-app.azurewebsites.net/api/auth/login-url
```

---

## 🔄 **Despliegues Futuros**

Después de esta configuración inicial, el despliegue es **100% automático**:

1. Haces cambios en `backend/`
2. Commit: `git commit -am "feat: nuevo feature"`
3. Push: `git push`
4. GitHub Actions despliega automáticamente
5. ¡Tu app se actualiza en Azure! 🚀

---

## 📊 **Monitoreo Post-Despliegue**

```bash
# Ver logs en tiempo real
az webapp log tail -g lama-foundation-rg -n lama-backend-app

# O en el portal:
# https://portal.azure.com → lama-backend-app → Monitoring → Log stream
```

---

## 🆘 **Troubleshooting**

### **Error: "Resource not found"**
- Verificar que el secret `AZURE_CREDENTIALS` esté configurado correctamente
- Verificar que el Service Principal tenga permisos

### **Error: "Build failed"**
- Revisar los logs del workflow en GitHub Actions
- Verificar que `package.json` y `tsconfig.json` estén correctos

### **Error: "Deployment failed"**
- Verificar que el Web App esté en estado "Running"
- Verificar que el startup command esté configurado

### **App no responde después del despliegue**
- Revisar logs con `az webapp log tail`
- Verificar App Settings (DB connection, secrets)
- Verificar que Key Vault references funcionen

---

## 🎉 **¡Listo para Producción!**

Con esta configuración, tienes:

✅ CI/CD completamente automatizado  
✅ Despliegue seguro con Service Principal  
✅ Build optimizado solo con dependencias de producción  
✅ Logs y monitoreo configurados  
✅ Workflow reutilizable para futuros cambios  

**¡Ahora solo queda hacer el push inicial!** 🚀
