# Instrucciones de Despliegue - Cloud Shell

## Paso 1: Abrir Cloud Shell en Azure Portal

1. Ir a https://portal.azure.com
2. Clic en icono Cloud Shell (>_) arriba a la derecha
3. Seleccionar **Bash**

## Paso 2: Subir código del backend

Opción A - Clonar desde GitHub:
```bash
git clone https://github.com/CSA-DanielVillamizar/PAGINA-WEB.git
cd PAGINA-WEB/backend
```

Opción B - Subir ZIP:
1. En tu máquina local, crear ZIP del backend (sin node_modules):
   ```powershell
   # En backend/
   Compress-Archive -Path .\* -DestinationPath ..\backend-deploy.zip -Force
   ```
2. En Cloud Shell, clic en "Upload/Download files"
3. Subir `backend-deploy.zip`
4. Descomprimir:
   ```bash
   mkdir -p backend
   unzip backend-deploy.zip -d backend/
   cd backend
   ```

## Paso 3: Ejecutar script de despliegue

```bash
# Dar permisos de ejecución
chmod +x deploy-cloudshell.sh

# Ejecutar despliegue
bash deploy-cloudshell.sh lama-dev-backend rg-lama-dev
```

El script hará:
- ✅ Obtener credenciales de publicación
- ✅ Inicializar repo git si no existe
- ✅ Añadir remote de Azure
- ✅ Push a Azure (dispara Oryx build)
- ✅ Verificar health endpoint
- ✅ Mostrar logs en tiempo real

## Paso 4: Verificar despliegue

```bash
# Health check
curl -s https://lama-dev-backend.azurewebsites.net/health | jq

# Ver logs
az webapp log tail -g rg-lama-dev -n lama-dev-backend
```

## Paso 5: Migraciones (opcional)

```bash
# SSH al contenedor
az webapp ssh -g rg-lama-dev -n lama-dev-backend

# Dentro del contenedor:
npm run migration:run
exit
```

## Comandos útiles

### Ver App Settings actuales
```bash
az webapp config appsettings list -g rg-lama-dev -n lama-dev-backend --output table
```

### Actualizar App Settings (si faltan)
```bash
az webapp config appsettings set -g rg-lama-dev -n lama-dev-backend --settings \
  DB_HOST="lama-dev-pg.postgres.database.azure.com" \
  DB_PORT="5432" \
  DB_NAME="lama_db" \
  DB_USER="pgadmin@lama-dev-pg" \
  DB_SSL="1" \
  NODE_ENV="production" \
  PORT="8080" \
  ENABLE_SWAGGER="0" \
  DISABLE_DB="0" \
  WEBSITE_NODE_DEFAULT_VERSION="~20" \
  SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
  WEBSITE_HEALTHCHECK_MAXPINGFAILURES="10"
```

**IMPORTANTE**: `DB_PASS`, `JWT_SECRET`, `AZURE_STORAGE_CONNECTION_STRING` deben añadirse vía portal (no en terminal por seguridad).

### Reiniciar App Service
```bash
az webapp restart -g rg-lama-dev -n lama-dev-backend
```

### Ver deployment en curso
```bash
az webapp deployment list-publishing-profiles -g rg-lama-dev -n lama-dev-backend --output table
```

## Troubleshooting

### Error: "Authentication failed"
- Verifica que Basic Auth esté habilitado en portal
- Regenera credenciales:
  ```bash
  az webapp deployment reset-publishing-profile -g rg-lama-dev -n lama-dev-backend
  ```

### Error 503 en /health
- Revisar logs: `az webapp log tail -g rg-lama-dev -n lama-dev-backend`
- Verificar App Settings (especialmente DB_PASS, DB_HOST)
- Confirmar que no existe `WEBSITE_RUN_FROM_PACKAGE`

### Build falla
- Asegurarse que `package.json` está en raíz del repo
- Verificar `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- Ver logs de Kudu: https://lama-dev-backend.scm.azurewebsites.net/

### DB Connection Error
- Verificar firewall de PostgreSQL permite Azure Services
- Confirmar usuario tiene formato `usuario@servidor`
- Probar conexión desde Cloud Shell:
  ```bash
  psql -h lama-dev-pg.postgres.database.azure.com -U pgadmin@lama-dev-pg -d lama_db
  ```

## Limpieza post-deploy

Si usaste credenciales embebidas y quieres limpiar:
```bash
git remote remove azure
git remote add azure https://lama-dev-backend.scm.azurewebsites.net:443/lama-dev-backend.git
```

## Contacto

Si necesitas ayuda, revisa los logs y documenta el error exacto antes de contactar.
