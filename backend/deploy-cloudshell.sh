#!/usr/bin/env bash
set -euo pipefail

# Despliegue simplificado para ejecutarse en Azure Cloud Shell (bash).
# Requisitos:
#   - Estar en directorio backend con package.json.
#   - App Service y App Settings listos.
#   - Basic Auth habilitado.
# Uso:
#   bash deploy-cloudshell.sh lama-dev-backend rg-lama-dev

APP_NAME="${1:-lama-dev-backend}"
RG_NAME="${2:-rg-lama-dev}"

echo "[INFO] App: $APP_NAME  RG: $RG_NAME"
echo "[INFO] Obteniendo credenciales publicación"
CREDS_JSON=$(az webapp deployment list-publishing-credentials -g "$RG_NAME" -n "$APP_NAME" --output json)
USER=$(echo "$CREDS_JSON" | jq -r '.publishingUserName')
PASS=$(echo "$CREDS_JSON" | jq -r '.publishingPassword')
SCM=$(echo "$CREDS_JSON" | jq -r '.scmUri')
if [[ -z "$PASS" || "$PASS" == "null" ]]; then
  echo "[WARN] Password vacío. Asegura Basic Auth habilitado en portal." >&2
fi

if [[ ! -f package.json ]]; then
  echo "[ERROR] package.json no encontrado en directorio actual." >&2
  exit 1
fi

if [[ ! -d .git ]]; then
  echo "[INFO] Inicializando repositorio Git (main)"
  git init --initial-branch=main
  git add .
  git commit -m "Init deploy"
fi

echo "[INFO] Ajustando remote azure"
git remote remove azure 2>/dev/null || true

# Remote con credenciales embebidas (simplifica en Cloud Shell). Considera rotar luego.
REMOTE_URL="https://${USER}:${PASS}@${APP_NAME}.scm.azurewebsites.net:443/${APP_NAME}.git"
git remote add azure "$REMOTE_URL"

echo "[INFO] Push main -> azure"
git push azure main || {
  echo "[ERROR] Falló el push" >&2
  exit 1
}

echo "[INFO] Esperando arranque (8s)"
sleep 8
HEALTH_URL="https://${APP_NAME}.azurewebsites.net/health"
echo "[INFO] Verificando health: $HEALTH_URL"
set +e
RESP=$(curl -s --max-time 10 "$HEALTH_URL")
RC=$?
set -e
if [[ $RC -eq 0 && -n "$RESP" ]]; then
  echo "[HEALTH] $RESP"
else
  echo "[WARN] Health no responde aún (RC=$RC). Revisa logs)."
fi

echo "[INFO] Tail logs (Ctrl+C para salir)"
az webapp log tail -g "$RG_NAME" -n "$APP_NAME"
