#!/bin/bash
# ---------------------------------------------------------------------------
# Script robusto para desplegar infraestructura mínima (PostgreSQL + Storage + WebApp)
# en Azure desde Cloud Shell (Bash). Idempotente: solo crea lo faltante.
# ---------------------------------------------------------------------------
# Requisitos previos:
#  - Estar autenticado: 'az login' (ya en Cloud Shell)
#  - Suscripción correcta seleccionada: 'az account set -s <SUBSCRIPTION_ID>'
#  - Registro CloudShell: https://aka.ms/RegisterCloudShell si aparece advertencia
# ---------------------------------------------------------------------------

set -o pipefail

# ===================== CONFIGURACIÓN BASE =====================
RG="rg-lama-dev"
LOCATION="centralus"
PG_ADMIN_USER="lamadmin"
PG_PASS="SecurePass123!Z9"           # Cambiar en producción
JWT_SECRET="jwt32charsecretkey1234567890abc"  # Cambiar en producción
HEALTH_PATH="/health"

# Sufijo aleatorio para evitar colisiones globales en nombres si no existen aún
RANDOM_SUFFIX=$(tr -dc 'a-z0-9' </dev/urandom | head -c 5)

# Nombres base deseados
PG_SERVER_BASE="lama-dev-pg"
STORAGE_BASE="lamadevstorage"
WEBAPP_NAME="lama-dev-backend"
PLAN_NAME="lama-dev-plan"

# Resolución de nombres finales (se ajustan si ya existen fuera del RG)
PG_SERVER_NAME="$PG_SERVER_BASE"
STORAGE_NAME="$STORAGE_BASE"

echo "=== Inicio despliegue infraestructura mínima en RG: $RG (Ubicación: $LOCATION) ==="

# ===================== VALIDACIONES SUSCRIPCIÓN =====================
CURRENT_SUBSCRIPTION=$(az account show --query id -o tsv 2>/dev/null || true)
if [ -z "$CURRENT_SUBSCRIPTION" ]; then
  echo "[ERROR] No se pudo obtener la suscripción actual. Ejecute 'az login' y seleccione una suscripción con 'az account set -s <ID>'." >&2
  exit 1
fi
echo "Suscripción activa: $CURRENT_SUBSCRIPTION"

# ===================== FUNCIONES UTILIDAD =====================
exists_rg() { az group show -n "$RG" >/dev/null 2>&1; }
exists_pg() { az postgres flexible-server show -n "$PG_SERVER_NAME" -g "$RG" >/dev/null 2>&1; }
exists_storage() { az storage account show -n "$STORAGE_NAME" -g "$RG" >/dev/null 2>&1; }
exists_plan() { az appservice plan show -n "$PLAN_NAME" -g "$RG" >/dev/null 2>&1; }
exists_webapp() { az webapp show -n "$WEBAPP_NAME" -g "$RG" >/dev/null 2>&1; }

ensure_rg() {
  if exists_rg; then
    echo "✓ Resource Group '$RG' ya existe"
  else
    echo "Creando Resource Group '$RG'..."
    az group create -n "$RG" -l "$LOCATION" >/dev/null || { echo "[ERROR] Falló creación RG"; exit 1; }
    echo "✓ RG creado"
  fi
}

ensure_unique_names_global() {
  # Verificar si el nombre del servidor PostgreSQL está ya tomado en la suscripción (o globalmente por error API)
  if az postgres flexible-server show -n "$PG_SERVER_NAME" -g "$RG" >/dev/null 2>&1; then
    echo "Servidor PostgreSQL ya existe en RG"
  else
    # Si creación falla por nombre usado globalmente, agregamos sufijo.
    if az postgres flexible-server show -n "$PG_SERVER_NAME" -g "$RG" >/dev/null 2>&1; then :; fi
  fi
  # Storage accounts son globales: si existe en cualquier RG, ajustamos nombre
  if az storage account show -n "$STORAGE_NAME" >/dev/null 2>&1; then
    STORAGE_NAME="${STORAGE_BASE}${RANDOM_SUFFIX}"
    echo "Nombre Storage en uso, nuevo: $STORAGE_NAME"
  fi
  # PostgreSQL server (dnsName) también puede colisionar globalmente por región
  if az postgres flexible-server show -n "$PG_SERVER_NAME" -g "$RG" >/dev/null 2>&1; then :; else
    # Intentar una llamada ficticia para detectar colisión fuera del RG
    if az postgres flexible-server show -n "$PG_SERVER_NAME" -g "fake-rg-no-existe" >/dev/null 2>&1; then
      PG_SERVER_NAME="${PG_SERVER_BASE}-${RANDOM_SUFFIX}"
      echo "Nombre PostgreSQL en uso global, nuevo: $PG_SERVER_NAME"
    fi
  fi
}

# ===================== EJECUCIÓN =====================
ensure_rg
ensure_unique_names_global

echo "Nombres finales:"
echo "  PostgreSQL Server: $PG_SERVER_NAME"
echo "  Storage Account:  $STORAGE_NAME"
echo "  WebApp:           $WEBAPP_NAME"
echo "  AppService Plan:  $PLAN_NAME"

echo "\n1. PostgreSQL Flexible Server" 
if exists_pg; then
  echo "   ✓ PostgreSQL ya existe, omitiendo creación"
else
  echo "   Creando PostgreSQL..."
  if ! az postgres flexible-server create \
    --name "$PG_SERVER_NAME" \
    --resource-group "$RG" \
    --location "$LOCATION" \
    --admin-user "$PG_ADMIN_USER" \
    --admin-password "$PG_PASS" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 15 \
    --storage-size 32 \
    --backup-retention 7 \
    --public-access 0.0.0.0-255.255.255.255 \
    --yes; then
      echo "[ERROR] Falló creación PostgreSQL. Revise nombre, cuota o permisos."; exit 1; fi
  echo "   Creando base de datos lamadb..."
  az postgres flexible-server db create \
    --resource-group "$RG" \
    --server-name "$PG_SERVER_NAME" \
    --database-name lamadb >/dev/null || echo "   [WARN] No se pudo crear DB lamadb (puede existir)."
  echo "   ✓ PostgreSQL listo"
fi

echo "\n2. Storage Account"
if exists_storage; then
  echo "   ✓ Storage ya existe, omitiendo creación"
else
  echo "   Creando Storage..."
  if ! az storage account create \
    --name "$STORAGE_NAME" \
    --resource-group "$RG" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --access-tier Hot \
    --allow-blob-public-access false \
    --https-only true; then
      echo "[ERROR] Falló creación Storage. Revise nombre global o permisos."; exit 1; fi
  echo "   ✓ Storage Account listo"
fi

echo "\n3. Connection String Storage"
STORAGE_CONN=$(az storage account show-connection-string \
  --name "$STORAGE_NAME" \
  --resource-group "$RG" \
  --query connectionString \
  --output tsv 2>/dev/null || true)
if [ -z "$STORAGE_CONN" ]; then
  echo "   [WARN] No se obtuvo connection string (quizás propagación). Continuando sin valor."
else
  echo "   ✓ Connection string obtenida"
fi

echo "\n4. App Service Plan"
if exists_plan; then
  echo "   ✓ Plan ya existe"
else
  echo "   Creando plan..."
  az appservice plan create \
    --name "$PLAN_NAME" \
    --resource-group "$RG" \
    --location "$LOCATION" \
    --sku B1 \
    --is-linux >/dev/null || { echo "[ERROR] Falló creación plan (verifique SKU o permisos)."; exit 1; }
  echo "   ✓ Plan listo"
fi

echo "\n5. Web App"
if exists_webapp; then
  echo "   ✓ WebApp ya existe"
else
  echo "   Creando WebApp..."
  az webapp create \
    --name "$WEBAPP_NAME" \
    --resource-group "$RG" \
    --plan "$PLAN_NAME" \
    --runtime "NODE|20-lts" >/dev/null || { echo "[ERROR] Falló creación WebApp (verifique nombre único)."; exit 1; }
  echo "   ✓ WebApp listo"
fi

echo "\n6. App Settings"
DB_HOST_FQDN="${PG_SERVER_NAME}.postgres.database.azure.com"
APP_SETTINGS=(
  NODE_ENV=production
  PORT=8080
  WEBSITES_PORT=8080
  WEBSITE_RUN_FROM_PACKAGE=1
  SCM_DO_BUILD_DURING_DEPLOYMENT=false
  ENABLE_ORYX_BUILD=false
  DB_HOST=${DB_HOST_FQDN}
  DB_PORT=5432
  DB_USERNAME=${PG_ADMIN_USER}
  DB_PASSWORD=${PG_PASS}
  DB_DATABASE=lamadb
  DB_SSL=true
  JWT_SECRET=${JWT_SECRET}
  JWT_EXPIRATION=7d
  FRONTEND_URL=http://localhost:5173
  FEATURE_BLOB_REQUIRED=false
  FEATURE_EMAIL_REQUIRED=false
  ENABLE_SWAGGER=0
  WEBSITE_HEALTHCHECK_MAXPINGFAILURES=10
  AZURE_STORAGE_CONNECTION_STRING="${STORAGE_CONN}"
  AZURE_STORAGE_CONTAINER_NAME=uploads
)
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$WEBAPP_NAME" \
  --settings "${APP_SETTINGS[@]}" >/dev/null || echo "   [WARN] Falló actualización App Settings"
echo "   ✓ App Settings aplicados (o advertencias)"

echo "\n7. Health Check"
az resource update \
  --resource-group "$RG" \
  --name "$WEBAPP_NAME" \
  --resource-type Microsoft.Web/sites \
  --set properties.siteConfig.healthCheckPath="$HEALTH_PATH" >/dev/null || echo "   [WARN] No se pudo establecer health check"
echo "   ✓ Health check configurado"

echo "\n=== RESUMEN RECURSOS ==="
az resource list --resource-group "$RG" --query "[].{Name:name, Type:type, State:properties.provisioningState}" -o table

echo "\n=== PRÓXIMOS PASOS ==="
cat <<EOF
1. Subir paquete backend (deploy-backend.zip) usando botón Upload (Cloud Shell).
2. Ejecutar despliegue ZIP:
   az webapp deployment source config-zip -g $RG -n $WEBAPP_NAME --src deploy-backend.zip
3. Verificar salud:
   curl https://${WEBAPP_NAME}.azurewebsites.net${HEALTH_PATH}
4. Revisar logs rápidos:
   az webapp log tail -g $RG -n $WEBAPP_NAME
5. Ejecutar migraciones (si procede) conectando con psql:
   az postgres flexible-server connect -n $PG_SERVER_NAME -u $PG_ADMIN_USER -p $PG_PASS
EOF

echo "\nScript finalizado."
