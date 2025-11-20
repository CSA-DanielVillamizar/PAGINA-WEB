# ⚠️ PROBLEMA: APP SETTINGS VACÍOS → 503 ERROR

## 🔍 Causa
GitHub Actions desplegó código exitosamente PERO:
- Todos los App Settings del WebApp están en NULL
- La aplicación no puede arrancar sin variables de entorno
- Resultado: 503 Service Unavailable

## ✅ SOLUCIÓN RÁPIDA (Azure Portal - 2 minutos)

### Paso 1: Abrir Portal
https://portal.azure.com

### Paso 2: Navegar a Configuration
```
Resource Groups → lama-dev-rg → lama-backend-dev → Configuration → Application settings
```

### Paso 3: Agregar estos 10 settings

Click "New application setting" para cada uno:

```
Name: PORT
Value: 8080

Name: NODE_ENV  
Value: production

Name: DB_HOST
Value: lama-pg-dev.postgres.database.azure.com

Name: DB_PORT
Value: 5432

Name: DB_USER
Value: pgadmin@lama-pg-dev

Name: DB_NAME
Value: lama_db

Name: KEY_VAULT_NAME
Value: lama-kv-dev99

Name: APPINSIGHTS_INSTRUMENTATIONKEY
Value: 43d31ff7-79b9-4a57-9616-40740b25b778

Name: DB_PASS
Value: @Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/DB-PASSWORD)

Name: JWT_SECRET
Value: @Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/JWT-SECRET)
```

### Paso 4: Guardar
- Click botón "Save" en la parte superior
- El WebApp se reiniciará automáticamente (30-60 segundos)

### Paso 5: Verificar
Espera 2 minutos y prueba:

```powershell
curl https://lama-backend-dev.azurewebsites.net/health
curl https://lama-backend-dev.azurewebsites.net/health/ready
```

## 📝 NOTA
Azure CLI tiene problemas de certificados en tu entorno, por eso el Portal es más confiable.

## 🔄 Alternativa (si prefieres CLI):
Ejecuta estos comandos UNO POR UNO:

```powershell
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings PORT=8080
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings NODE_ENV=production
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_HOST=lama-pg-dev.postgres.database.azure.com
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_PORT=5432
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_USER=pgadmin@lama-pg-dev
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings DB_NAME=lama_db
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings KEY_VAULT_NAME=lama-kv-dev99
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings APPINSIGHTS_INSTRUMENTATIONKEY=43d31ff7-79b9-4a57-9616-40740b25b778
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings "DB_PASS=@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/DB-PASSWORD)"
az webapp config appsettings set -n lama-backend-dev -g lama-dev-rg --settings "JWT_SECRET=@Microsoft.KeyVault(SecretUri=https://lama-kv-dev99.vault.azure.net/secrets/JWT-SECRET)"
az webapp restart -n lama-backend-dev -g lama-dev-rg
```

## ✅ Resultado Esperado
Después de configurar:
- /health → 200 OK
- /health/ready → 200 OK (si migraciones están ejecutadas)
- App funcionando correctamente
