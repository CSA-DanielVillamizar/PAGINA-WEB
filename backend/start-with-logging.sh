#!/bin/bash
# Wrapper para capturar toda la salida de npm start
echo "[WRAPPER] Iniciando aplicación con logging completo..."
echo "[WRAPPER] NODE_VERSION=$(node --version)"
echo "[WRAPPER] NPM_VERSION=$(npm --version)"
echo "[WRAPPER] DISABLE_DB=$DISABLE_DB"
echo "[WRAPPER] NODE_ENV=$NODE_ENV"
echo "[WRAPPER] PORT=$PORT"
echo "[WRAPPER] PWD=$(pwd)"
echo "[WRAPPER] ---"

# Ejecutar npm start y capturar tanto stdout como stderr
npm start 2>&1 | tee /tmp/app-startup.log

# Si npm start falla, mostrar el código de salida
EXIT_CODE=$?
echo "[WRAPPER] npm start finalizó con código: $EXIT_CODE"

if [ $EXIT_CODE -ne 0 ]; then
  echo "[WRAPPER] ERROR: La aplicación falló al iniciar"
  echo "[WRAPPER] Últimas líneas del log:"
  tail -50 /tmp/app-startup.log
  exit $EXIT_CODE
fi
