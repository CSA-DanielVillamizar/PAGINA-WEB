import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfidentialClientApplication, Configuration, AuthorizationCodeRequest, AuthError } from '@azure/msal-node';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de autenticación con Microsoft Entra ID (Azure AD) y JWT.
 * Ahora soporta modo multi-tenant (common/organizations) y validación flexible de dominio externo.
 * Incluye retry exponencial en adquisición de tokens y parsing robusto de claims.
 */
@Injectable()
export class AuthService {
  private msalClient: ConfidentialClientApplication;
  private readonly logger = new Logger(AuthService.name);
  private readonly allowedDomain: string;

  constructor(private configService: ConfigService) {
    this.allowedDomain = this.configService.get<string>('ALLOWED_EMAIL_DOMAIN') || 'fundacionlamamedellin.org';
    // Determinar authority: si MULTI_TENANT=true usar 'common', caso contrario tenant específico.
    const multiTenant = this.configService.get<string>('MULTI_TENANT') === 'true';
    const tenantId = this.configService.get<string>('ENTRA_TENANT_ID');
    const authority = multiTenant
      ? 'https://login.microsoftonline.com/common'
      : `https://login.microsoftonline.com/${tenantId}`;

    // En pruebas unitarias podemos inyectar valores dummy para evitar error de credenciales vacías.
    const clientId = this.configService.get<string>('ENTRA_CLIENT_ID') || 'test-client-id';
    const clientSecret = this.configService.get<string>('ENTRA_CLIENT_SECRET') || 'test-client-secret';

    const msalConfig: Configuration = {
      auth: {
        clientId,
        authority,
        clientSecret,
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message) => {
            if (level <= 2) this.logger.debug(message);
          },
          piiLoggingEnabled: false,
          logLevel: 2
        }
      }
    };

    this.msalClient = new ConfidentialClientApplication(msalConfig);
  }

  /**
   * Valida si el correo coincide con el dominio permitido, aunque dicho dominio no esté verificado en el tenant.
   * Si el dominio no coincide, se permite el acceso pero se marca como externo (para futura lógica).
   */
  validateUserByEmailDomain(email: string): { allowed: boolean; external: boolean } {
    const lower = email.toLowerCase();
    const domainPart = lower.split('@')[1] || '';
    if (domainPart === this.allowedDomain) {
      return { allowed: true, external: false };
    }
    // Permitimos acceso, pero marcamos usuario externo para posible restricción de roles avanzados.
    return { allowed: true, external: true };
  }

  /** Encripta contraseña (uso eventual para cuentas locales complementarias). */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /** Compara hash. */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Adquiere token usando authorization code con retry exponencial para errores transitorios.
   */
  async acquireTokenByCode(code: string) {
    const redirectUri = `${this.configService.get<string>('FRONTEND_URL')}/auth/callback`;
    const tokenRequest: AuthorizationCodeRequest = {
      code,
      scopes: ['User.Read'],
      redirectUri,
    };

    const maxRetries = 3;
    let attempt = 0;
    while (true) {
      try {
        const response = await this.msalClient.acquireTokenByCode(tokenRequest);
        return response;
      } catch (error: any) {
        const isAuthError = error instanceof AuthError;
        attempt++;
        if (!isAuthError || attempt >= maxRetries) {
          this.logger.error(`Error definitivo acquiring token: ${error.message}`);
          throw new Error('Error al obtener token de Azure AD');
        }
        const delay = 300 * attempt * attempt; // Backoff cuadrático
        this.logger.warn(`Fallo acquiring token (intento ${attempt}) reintentando en ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  /**
   * Decodifica el JWT sin validación criptográfica (para entorno dev); en prod usar librerías oficiales o Graph.
   */
  private decodeJwt(accessToken: string) {
    const [headerB64, payloadB64] = accessToken.split('.').slice(0, 2);
    if (!payloadB64) throw new Error('JWT mal formado');
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json);
  }

  /**
   * Valida token de Azure y retorna datos normalizados. Marca usuario como externo si dominio difiere.
   */
  async validateAzureToken(accessToken: string) {
    try {
      const payload = this.decodeJwt(accessToken);
      // Campos posibles según tipo de cuenta (AAD vs MSA): preferred_username, upn, email
      const email = (payload.preferred_username || payload.upn || payload.email || '').toLowerCase();
      if (!email) throw new Error('No se encontró claim de correo en el token');
      const domainInfo = this.validateUserByEmailDomain(email);

      return {
        email,
        name: payload.name || payload.given_name || email.split('@')[0],
        id: payload.oid || payload.sub,
        external: domainInfo.external
      };
    } catch (error) {
      this.logger.error('Error validating Azure token', error instanceof Error ? error.stack : String(error));
      throw new Error('Token de Azure AD inválido');
    }
  }

  /** Genera URL de autorización Microsoft (multi-tenant si configurado). */
  async getAuthorizationUrl(): Promise<string> {
    const redirectUri = `${this.configService.get<string>('FRONTEND_URL')}/auth/callback`;
    const parameters = {
      scopes: ['User.Read'],
      redirectUri,
    };
    return this.msalClient.getAuthCodeUrl(parameters);
  }
}
