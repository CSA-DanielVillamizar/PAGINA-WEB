# Pre-Deployment Checklist ✅

Usa esta lista antes de desplegar a producción para asegurarte de que todo está configurado correctamente.

## Desarrollo Local

### Backend
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run build` compila correctamente
- [ ] Backend arranca en puerto 8080
- [ ] Health check responde: `curl http://localhost:8080/health`
- [ ] SMTP configurado y probado: `.\Test-Email-SMTP.ps1`
- [ ] Email de prueba recibido correctamente
- [ ] Endpoint de inscripciones responde: `POST /api/inscriptions/send-email`

### Frontend
- [ ] `npm install` ejecutado sin errores
- [ ] `npm run dev` arranca en puerto 5173
- [ ] Sitio carga sin errores en navegador
- [ ] Navegación entre páginas funciona
- [ ] Página de Historia carga con imagen de fundador
- [ ] Formulario de inscripción se renderiza
- [ ] PDF se descarga con branding (logo + amarillo)
- [ ] Proxy `/api` redirige correctamente al backend

### Integración Frontend-Backend
- [ ] Backend corriendo en 8080
- [ ] Frontend corriendo en 5173
- [ ] CORS configurado (`FRONTEND_URL=http://localhost:5173`)
- [ ] Formulario envía datos al backend
- [ ] Email llega con PDF adjunto
- [ ] No hay errores de CORS en consola del navegador

## Código y Repositorio

### Limpieza
- [ ] No hay `console.log` de debug en código de producción
- [ ] Archivos `.env` **NO** están en el repositorio
- [ ] `.gitignore` incluye `.env`, `node_modules`, `dist`
- [ ] Contraseñas **NO** están hardcodeadas en código
- [ ] Secretos referenciados vía variables de entorno

### Documentación
- [ ] `README.md` actualizado con instrucciones claras
- [ ] `.env.example` tiene todas las variables necesarias
- [ ] `DEPLOYMENT_GUIDE_AZURE.md` revisado
- [ ] Scripts PowerShell documentados con ejemplos

### Tests (si aplica)
- [ ] Tests unitarios pasan: `npm test`
- [ ] Tests e2e (si existen) pasan
- [ ] Coverage mínimo alcanzado (si aplica)

## Azure - Infraestructura

### Recursos Base
- [ ] Resource Group creado
- [ ] PostgreSQL Flexible Server creado
- [ ] Base de datos `lama_db` existe
- [ ] Firewall PostgreSQL permite conexión desde Azure
- [ ] Key Vault creado
- [ ] App Service Plan (Linux, Node 20) creado
- [ ] Web App (backend) creado
- [ ] Static Web App (frontend) creado

### Key Vault
- [ ] Secret `db-password` almacenado
- [ ] Secret `smtp-pass` almacenado
- [ ] Secret `jwt-secret` almacenado
- [ ] Web App tiene identidad administrada habilitada
- [ ] Web App tiene permisos en Key Vault (`get`, `list`)

### PostgreSQL
- [ ] Usuario admin configurado
- [ ] Conexión SSL habilitada
- [ ] Backup automático configurado (7-14 días)
- [ ] Reglas de firewall permiten IP de App Service
- [ ] Base de datos `lama_db` creada

### App Service (Backend)
- [ ] Runtime: Node 20 LTS
- [ ] `WEBSITE_STARTUP_FILE=node dist/main.js`
- [ ] `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- [ ] Identidad administrada asignada
- [ ] Permisos de Key Vault configurados

## Azure - Configuración

### App Settings - Backend
- [ ] `DB_HOST` apunta al FQDN de PostgreSQL
- [ ] `DB_USER` y `DB_NAME` correctos
- [ ] `DB_PASS` referencia Key Vault
- [ ] `DB_SSL=1`
- [ ] `SMTP_HOST=smtp.office365.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER=gerencia@fundacionlamamedellin.org`
- [ ] `SMTP_PASS` referencia Key Vault
- [ ] `SMTP_FROM` configurado
- [ ] `INSCRIPTIONS_RECEIVER` configurado
- [ ] `JWT_SECRET` referencia Key Vault
- [ ] `FRONTEND_URL` apunta a Static Web App
- [ ] `NODE_ENV=production`
- [ ] `PORT=8080`

### Static Web App - Frontend
- [ ] Token de despliegue en GitHub Secrets
- [ ] Workflow GitHub Actions configurado
- [ ] `app_location=/frontend`
- [ ] `output_location=dist`
- [ ] Variable `VITE_API_URL` apunta al backend

## Deployment

### Backend
- [ ] Código compilado (`npm run build`)
- [ ] Publish Profile descargado del portal
- [ ] Secret `AZURE_BACKEND_PUBLISH_PROFILE` en GitHub
- [ ] Workflow `.github/workflows/backend-deploy.yml` creado
- [ ] Push a `main` dispara despliegue
- [ ] Despliegue exitoso (sin errores en Actions)
- [ ] App Service muestra "Running"

### Frontend
- [ ] Token SWA en GitHub Secrets
- [ ] Workflow `.github/workflows/frontend-deploy.yml` creado
- [ ] Build de producción funciona: `npm run build`
- [ ] Despliegue exitoso en SWA
- [ ] Sitio accesible públicamente

### Migraciones
- [ ] SSH al App Service funciona
- [ ] `npm run migration:run` ejecutado
- [ ] Tablas creadas en PostgreSQL
- [ ] Seed de roles ejecutado (si aplica)

## Post-Deployment - Validación

### Health Checks
- [ ] Backend health: `curl https://<backend>.azurewebsites.net/health`
- [ ] API responde: `curl https://<backend>.azurewebsites.net/api/health`
- [ ] Frontend carga: Abrir URL de Static Web App
- [ ] No hay errores 5xx en logs

### Funcionalidad
- [ ] Email diagnóstico funciona: `/api/diagnostics/email?to=test@...`
- [ ] Formulario de inscripción envía correctamente
- [ ] PDF se descarga con branding
- [ ] Email llega a `gerencia@fundacionlamamedellin.org`
- [ ] PDF adjunto llega correctamente
- [ ] No hay errores de CORS en navegador

### Logs y Monitoreo
- [ ] Logs de App Service accesibles: `az webapp log tail`
- [ ] No hay errores críticos en logs
- [ ] Application Insights configurado (opcional)
- [ ] Alertas configuradas para errores 5xx (opcional)

## Seguridad

### Secrets
- [ ] Todas las contraseñas en Key Vault
- [ ] Referencias `@Microsoft.KeyVault(...)` funcionan
- [ ] No hay secretos en código o logs
- [ ] `.env` en `.gitignore`

### Network
- [ ] PostgreSQL firewall limitado a IPs necesarias
- [ ] HTTPS habilitado en App Service
- [ ] CORS configurado correctamente
- [ ] No hay endpoints sin autenticación (si aplica)

### Compliance
- [ ] Política de contraseñas seguidas
- [ ] MFA habilitado en cuenta Azure
- [ ] Backup de PostgreSQL configurado
- [ ] Plan de rotación de secretos documentado

## Performance

- [ ] App Service en región cercana a usuarios
- [ ] CDN configurado para Static Web App (opcional)
- [ ] Caché habilitado donde sea apropiado
- [ ] Índices de DB optimizados
- [ ] Logs no verbosos en producción (`NODE_ENV=production`)

## Rollback Plan

- [ ] Backup de base de datos antes de deployment
- [ ] Slots de staging configurados (opcional)
- [ ] Versión anterior tagged en Git
- [ ] Documentado proceso de rollback
- [ ] Contacto de soporte identificado

## Comunicación

- [ ] Equipo notificado del deployment
- [ ] Ventana de mantenimiento comunicada (si aplica)
- [ ] Usuarios notificados de nueva funcionalidad
- [ ] Soporte preparado para incidencias

## Notas Finales

Fecha de Checklist: _______________________
Ejecutado por: _______________________
Deployment exitoso: [ ] Sí [ ] No
Incidencias encontradas:
___________________________________________
___________________________________________
___________________________________________

## Referencias Rápidas

- Guía completa: `DEPLOYMENT_GUIDE_AZURE.md`
- Quick start: `QUICK_START.md`
- Backend README: `backend/README.md`
- Scripts: `backend/*.ps1`

---

**🎯 Tip:** Imprime esta checklist y márcala físicamente durante el deployment para no olvidar ningún paso crítico.
