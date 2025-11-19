# 🔐 Configuración Multi-Tenant para MSAL (Microsoft Entra ID)

## Contexto
La aplicación soporta **autenticación multi-tenant** para permitir que usuarios con cuentas de dominios externos (ej: `@fundacionlamamedellin.org`) puedan iniciar sesión aunque dicho dominio no esté verificado en el tenant de Azure AD.

## Variables de Entorno Requeridas

```bash
# Multi-tenant mode (usa authority 'common' en vez de tenant-specific)
MULTI_TENANT=true

# Tenant ID del Azure AD (para referencia, no limita logins)
ENTRA_TENANT_ID=95bb5dd0-a2fa-4336-9db4-fee9c5cbe8ae

# Client ID de la App Registration
ENTRA_CLIENT_ID=<REEMPLAZAR_CON_CLIENT_ID>

# Client Secret de la App Registration
ENTRA_CLIENT_SECRET=<REEMPLAZAR_CON_CLIENT_SECRET>

# Dominio de correo permitido (sin @)
ALLOWED_EMAIL_DOMAIN=fundacionlamamedellin.org
```

## Pasos para App Registration (Multi-Tenant)

### 1. Crear App Registration en Azure Portal
1. Ir a **Azure Active Directory** → **App registrations** → **New registration**
2. Name: `LAMA Medellin Web App`
3. **Supported account types**: Seleccionar **"Accounts in any organizational directory (Any Azure AD directory - Multitenant)"**
   - Esto permite que usuarios de cualquier tenant (incluidos dominios externos verificados en otros tenants) puedan autenticarse
4. **Redirect URI**: 
   - Type: Web
   - URI: `http://localhost:5173/auth/callback` (dev)
   - Producción: `https://fundacionlamamedellin.org/auth/callback`
5. Click **Register**

### 2. Copiar credenciales
- **Application (client) ID** → Variable `ENTRA_CLIENT_ID`
- **Directory (tenant) ID** → Variable `ENTRA_TENANT_ID`

### 3. Crear Client Secret
1. Ir a **Certificates & secrets** → **New client secret**
2. Description: `prod-secret` o `dev-secret`
3. Expires: 6 meses (dev) o 12-24 meses (prod)
4. Copiar **Value** (solo se muestra una vez) → Variable `ENTRA_CLIENT_SECRET`

### 4. Configurar API Permissions (opcional para perfil extendido)
1. Ir a **API permissions**
2. Ya debería tener `User.Read` (Microsoft Graph, Delegated)
3. Si necesitas acceso a más datos (fotos, calendarios): agregar permisos adicionales y solicitar admin consent

### 5. Authentication Settings
1. Ir a **Authentication**
2. **Platform configurations** → Web (ya configurado)
3. **Implicit grant and hybrid flows**: NO activar (usamos Authorization Code flow)
4. **Advanced settings**:
   - Allow public client flows: **NO** (confidential app)
   - Supported account types: **Multitenant** (ya configurado en paso 1)

## Lógica de Validación de Dominio

### Código en `auth.service.ts`:
```typescript
validateUserByEmailDomain(email: string): { allowed: boolean; external: boolean } {
  const lower = email.toLowerCase();
  const domainPart = lower.split('@')[1] || '';
  if (domainPart === this.allowedDomain) {
    return { allowed: true, external: false }; // Usuario del dominio principal
  }
  // Usuarios de otros dominios marcados como externos
  return { allowed: true, external: true };
}
```

### Flujo Multi-Tenant
1. Usuario visita `/auth/login-url` → Backend genera URL con authority `common`:
   ```
   https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...
   ```
2. Usuario selecciona cuenta Microsoft (puede ser de cualquier tenant o cuenta personal MSA)
3. Microsoft redirige a `http://localhost:5173/auth/callback?code=ABC123`
4. Frontend envía `code` a `POST /auth/callback`
5. Backend intercambia `code` por token con **retry exponencial** (3 intentos)
6. Backend decodifica JWT y extrae claims (`preferred_username`, `upn`, `email`)
7. Backend valida dominio:
   - Si coincide con `ALLOWED_EMAIL_DOMAIN` → `external: false`
   - Si no coincide → `external: true` (permitido pero marcado)
8. Backend crea/actualiza usuario en DB con campo `external`
9. Backend genera JWT interno con payload:
   ```json
   {
     "sub": "user-uuid",
     "email": "user@fundacionlamamedellin.org",
     "roles": ["Miembro"],
     "external": false
   }
   ```

## Casos de Uso

### Usuario del dominio principal (`@fundacionlamamedellin.org`)
- `external: false`
- Acceso completo a roles avanzados (Administrador, Presidente, etc.)

### Usuario de cuenta Microsoft personal (`@outlook.com`, `@gmail.com`)
- `external: true`
- Puede iniciar sesión pero roles limitados (ej: solo Invitado)
- Lógica futura: agregar validación en Guards para restringir operaciones críticas si `external === true`

## Ejemplo de Restricción por External Flag (futuro)

```typescript
// roles.guard.ts (modificación futura)
canActivate(context: ExecutionContext): boolean {
  const request = context.switchToHttp().getRequest();
  const user = request.user;
  
  // Si usuario es externo, bloquear roles admin
  if (user.external && requiredRoles.includes('Administrador')) {
    throw new ForbiddenException('Usuarios externos no pueden ser Administrador');
  }
  
  return user.roles.some(r => requiredRoles.includes(r.name));
}
```

## Seguridad

### Producción:
1. **Client Secret en Key Vault**: No hardcodear en código ni .env publicado
   ```bash
   az keyvault secret set --vault-name lama-kv-prod --name ENTRA-CLIENT-SECRET --value "<secret>"
   ```
2. **Referencia desde Web App**:
   ```bash
   az webapp config appsettings set -g lama-rg-prod -n lama-api-prod --settings \
     ENTRA_CLIENT_SECRET=@Microsoft.KeyVault(SecretUri=https://lama-kv-prod.vault.azure.net/secrets/ENTRA-CLIENT-SECRET/)
   ```
3. **Managed Identity**: Asignar rol "Key Vault Secrets User" al Web App para acceso sin contraseña
4. **HTTPS Only**: Siempre usar `https://` en redirect URIs de producción
5. **Token Validation**: En producción, validar firma del token con Microsoft Graph o JWKS endpoint

## Testing Local

```powershell
# 1. Actualizar .env con credenciales reales
# 2. Iniciar backend
cd backend
npm run start:dev

# 3. Obtener URL de login
curl http://localhost:3000/api/auth/login-url

# 4. Abrir URL en navegador, autenticar con cuenta Microsoft

# 5. Extraer código del callback (en URL bar tras redirect)
# http://localhost:5173/auth/callback?code=0.ARoA0F27lfoqNkOdtP7pxcvori...

# 6. Enviar código al backend
curl -X POST http://localhost:3000/api/auth/callback `
  -H "Content-Type: application/json" `
  -d '{"code": "0.ARoA0F27lfoqNkOdtP7pxcvori..."}'

# Respuesta:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "uuid",
#     "nombreCompleto": "Juan Perez",
#     "correo": "juan@fundacionlamamedellin.org",
#     "roles": [],
#     "external": false
#   }
# }
```

## Troubleshooting

### Error: "AADSTS50020: User account from identity provider does not exist in tenant"
- **Causa**: App Registration configurada como Single Tenant
- **Solución**: Cambiar a Multitenant en Authentication settings

### Error: "invalid_client_credential"
- **Causa**: `ENTRA_CLIENT_SECRET` vacío o incorrecto
- **Solución**: Regenerar secret en Azure Portal y actualizar .env

### Error: "Dominio de correo no autorizado"
- **Causa**: Dominio del usuario no coincide con `ALLOWED_EMAIL_DOMAIN`
- **Solución**: 
  - Si es esperado: usuario marcado como `external: true` (permitido)
  - Si bloqueaste manualmente: verificar lógica en `validateUserByEmailDomain`

### Usuario con cuenta personal no puede acceder
- **Causa**: Si usas authority `/organizations` en vez de `/common`, las cuentas MSA personales están bloqueadas
- **Solución**: Asegurar `MULTI_TENANT=true` y que authority sea `/common`

## Referencias
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)
- [Azure AD Multi-Tenant Apps](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-convert-app-to-be-multi-tenant)
- [Authorization Code Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
