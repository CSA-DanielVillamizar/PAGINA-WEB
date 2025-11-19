# 🔧 Solución a Problemas de SSL con Azure CLI

## 🚨 Problema
Al ejecutar comandos de Azure CLI, aparece el error:
```
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: unable to get local issuer certificate
```

## 🎯 Causas Comunes
1. **Proxy corporativo** con certificados self-signed
2. **Antivirus/Firewall** interceptando conexiones HTTPS
3. **Certificados CA corporativos** no confiados por Python
4. **VPN** con inspección SSL/TLS

---

## ✅ Soluciones

### Solución 1: Deshabilitar Verificación SSL (Temporal)
```powershell
# En cada sesión de PowerShell
$env:AZURE_CLI_DISABLE_CONNECTION_VERIFICATION=1

# Verificar
az account show
```

**⚠️ ADVERTENCIA**: Solo usar en entorno de desarrollo. NO recomendado para producción.

---

### Solución 2: Azure Portal (Recomendado)
En lugar de usar Azure CLI, crear recursos directamente en:
- https://portal.azure.com

**Ventajas**:
- ✅ No requiere CLI
- ✅ No tiene problemas de certificados
- ✅ Interfaz visual intuitiva
- ✅ Documentación en `AZURE_PORTAL_SETUP.md`

---

### Solución 3: Instalar Certificados Corporativos
```powershell
# 1. Exportar certificado del navegador
# En Edge/Chrome:
# - Ir a Settings → Privacy and Security → Security → Manage Certificates
# - Exportar certificado raíz (Base64)

# 2. Añadir al trust store de Python
$certPath = "C:\path\to\cert.cer"
$pythonCerts = "$env:LOCALAPPDATA\Programs\Python\PythonXX\Lib\site-packages\certifi\cacert.pem"

# Añadir certificado
Get-Content $certPath | Add-Content $pythonCerts
```

---

### Solución 4: Device Code Flow (Ya Usado)
```powershell
# Autenticación exitosa con device code
az login --use-device-code
```

✅ **Esta solución YA funcionó** para autenticarte inicialmente.

---

### Solución 5: Azure Cloud Shell
Usar Azure Cloud Shell en el navegador:
1. Ir a https://portal.azure.com
2. Click en el icono `>_` (Cloud Shell) en la barra superior
3. Ejecutar comandos Azure CLI sin problemas de SSL

```bash
# En Cloud Shell (Bash)
az group create --name lama-foundation-rg --location centralus

az storage account create \
  --name lamastoragecus \
  --resource-group lama-foundation-rg \
  --location centralus \
  --sku Standard_LRS

az keyvault create \
  --name lama-kv-centralus \
  --resource-group lama-foundation-rg \
  --location centralus \
  --enable-rbac-authorization

az postgres flexible-server create \
  --name lama-pg-centralus \
  --resource-group lama-foundation-rg \
  --location centralus \
  --admin-user pgadmin \
  --admin-password "LAMAadmin2024!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --backup-retention 7 \
  --yes
```

---

### Solución 6: Actualizar Azure CLI y Python
```powershell
# Actualizar Azure CLI
az upgrade

# O reinstalar
winget install Microsoft.AzureCLI --force

# Verificar versión
az version
```

---

### Solución 7: Usar REST API Directamente
Alternativa para operaciones específicas:

```powershell
# Obtener token
$token = (az account get-access-token --query accessToken -o tsv)

# Hacer request REST
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Method GET `
  -Uri "https://management.azure.com/subscriptions/f301f085-0a60-44df-969a-045b4375d4e7/resourceGroups?api-version=2021-04-01" `
  -Headers $headers
```

---

## 🎯 Recomendación para Este Proyecto

Dado que los comandos largos de Azure CLI fallan consistentemente:

### 1. **Para autenticación**: ✅ Device code flow (ya funcionando)
```powershell
az login --use-device-code
```

### 2. **Para crear recursos**: 🌐 Azure Portal
- Seguir guía: `AZURE_PORTAL_SETUP.md`
- Tiempo estimado: 30 minutos
- Sin problemas de SSL

### 3. **Para consultas rápidas**: ☁️ Azure Cloud Shell
- Comandos simples: `az resource list`, `az account show`
- Verificación de estado

### 4. **Para despliegue de código**: 🚀 GitHub Actions
- Workflow ya configurado en `.github/workflows/deploy-backend.yml`
- Se ejecuta en runners de GitHub (sin problemas de SSL)

---

## 📝 Checklist de Diagnóstico

Si quieres investigar más:

```powershell
# 1. Verificar proxy
[System.Net.WebRequest]::DefaultWebProxy
$env:HTTP_PROXY
$env:HTTPS_PROXY

# 2. Verificar certificados Python
python -m certifi

# 3. Verificar versión Azure CLI
az version

# 4. Test de conectividad
Test-NetConnection management.azure.com -Port 443

# 5. Verificar políticas corporativas
Get-ExecutionPolicy
```

---

## 🆘 Si Nada Funciona

**Plan B**: Usar Visual Studio Code con Azure Extension

1. Instalar extensión: `ms-azuretools.vscode-azureresourcegroups`
2. Crear recursos desde VS Code:
   - View → Command Palette (`Ctrl+Shift+P`)
   - `Azure: Create Resource Group`
   - `Azure: Create Storage Account`
   - etc.

---

## 📚 Referencias

- [Azure CLI SSL Issues](https://learn.microsoft.com/cli/azure/use-cli-effectively#work-behind-a-proxy)
- [Certificate Verification](https://docs.python-requests.org/en/latest/user/advanced/#ssl-cert-verification)
- [Azure Cloud Shell](https://learn.microsoft.com/azure/cloud-shell/overview)

