# Guía de Desarrollo Local - LAMA Backend

## ✅ Estado del Proyecto

El backend compila y arranca correctamente en **< 1 segundo** localmente.

## 🚀 Inicio Rápido

### Opción 1: Desarrollo sin Base de Datos (Recomendado para UI)

```powershell
cd backend
$env:NODE_ENV="development"
$env:PORT="3000"
$env:DISABLE_DB="1"
$env:ENABLE_SWAGGER="0"
$env:FEATURE_BLOB_REQUIRED="false"
$env:FEATURE_EMAIL_REQUIRED="false"
npm start
```

El servidor estará disponible en:
- Health: http://localhost:3000/health
- API: http://localhost:3000/api/

### Opción 2: Con Base de Datos PostgreSQL

```powershell
cd backend
$env:NODE_ENV="development"
$env:PORT="3000"
$env:DISABLE_DB="0"  # Habilitar DB
$env:DB_HOST="lama-pg-dev.postgres.database.azure.com"
$env:DB_PORT="5432"
$env:DB_USER="pgadmin"
$env:DB_PASS="LAMAdev2025!Secure"
$env:DB_NAME="lama_db"
$env:DB_SSL="1"
npm start
```

### Opción 3: Con Swagger (Documentación API)

```powershell
cd backend
$env:ENABLE_SWAGGER="1"
# ... resto de variables
npm start
```

Swagger estará en: http://localhost:3000/api/docs

## 📝 Scripts Disponibles

```powershell
npm run build       # Compilar TypeScript a dist/
npm start           # Iniciar servidor (requiere build previo)
npm run start:dev   # Desarrollo con watch (nodemon)
npm test            # Ejecutar tests
```

## 🔍 Diagnóstico

### Ver logs en tiempo real
Los logs se muestran directamente en consola con el formato:
```
[Nest] PID - TIMESTAMP LOG [Context] Message
```

### Health Check
```powershell
curl http://localhost:3000/health
# o
Invoke-WebRequest http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "service": "lama-backend",
  "uptime": 1.234
}
```

### Verificar Puerto
```powershell
netstat -ano | findstr :3000
```

## 🐛 Problemas Conocidos y Soluciones

### Backend arranca pero no responde
**Síntoma**: Logs muestran "successfully started" pero curl falla

**Causa**: El proceso de Node se cierra inmediatamente después del listen

**Solución Temporal**: 
- Usar `npm run start:dev` en lugar de `npm start`
- O mantener la terminal abierta después del arrange

### Error "Cannot find module"
**Solución**:
```powershell
npm run build
```

### Puerto 3000 en uso
**Solución**:
```powershell
# Encontrar proceso
netstat -ano | findstr :3000
# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

## 🔒 Seguridad en Desarrollo

- `.env` está en `.gitignore` - nunca commitear credenciales
- Usar `DISABLE_DB=1` si no necesitas la DB
- Passwords de desarrollo deben ser diferentes a producción

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── main.ts              # Entry point (bootstrap)
│   ├── app.module.ts        # Módulo raíz
│   ├── database/
│   │   └── database.provider.ts  # Lazy DB init
│   ├── modules/
│   │   ├── health/          # Health checks
│   │   ├── diagnostics/     # Blob/Email diagnostics
│   │   └── ...              # Módulos funcionales
│   └── services/
│       ├── blob.service.ts  # Azure Storage
│       └── mailer.service.ts
├── dist/                    # Código compilado
└── node_modules/
```

## 📊 Métricas de Rendimiento

- **Cold start local**: ~900ms
- **Cold start Azure**: Actualmente >25s (problema de infra)
- **Memory usage**: ~50-80MB sin DB
- **Endpoints disponibles**: 4 (health, ready, diagnostics x2)

## 🎯 Próximos Pasos

1. ✅ Backend local funciona
2. ⏳ Arreglar cold start en Azure
3. ⏳ Frontend Next.js local
4. ⏳ Integración frontend-backend local

## 📞 Soporte

Si encuentras problemas, verifica:
1. `npm run build` sin errores
2. Puerto 3000 libre
3. Node version 20+ (`node --version`)
4. Variables de entorno configuradas

---

**Última actualización**: 2025-11-25
**Versión**: 0.1.0
