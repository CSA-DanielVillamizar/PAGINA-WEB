#!/bin/bash
# Inicio minimalista optimizado para cold start en Azure App Service.
# Objetivo: responder /health en <1s. Se reducen logs y diagnósticos pesados.

LOG_DIR="/home/LogFiles"; LOG_FILE="$LOG_DIR/app-startup.log"; mkdir -p "$LOG_DIR"
echo "[BOOT] start $(date -Is) node=$(node --version) disable_db=${DISABLE_DB:-0}" | tee -a "$LOG_FILE"
echo "[BOOT] minimal cold start" | tee -a "$LOG_FILE"

export NODE_PATH="/home/site/wwwroot/node_modules:$NODE_PATH"

# Lanzar la aplicación directamente (sin npm para ahorrar tiempo de spawn)
node dist/main.js 2>&1 | tee -a "$LOG_FILE"
EXIT_CODE=${PIPESTATUS[0]}
echo "[BOOT] exit_code=$EXIT_CODE" | tee -a "$LOG_FILE"
exit $EXIT_CODE

