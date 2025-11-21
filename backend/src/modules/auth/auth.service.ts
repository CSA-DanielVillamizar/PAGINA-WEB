import { Injectable, Logger, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfidentialClientApplication, Configuration, AuthorizationCodeRequest, AuthError } from '@azure/msal-node';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { EmailConfirmationToken } from './email-confirmation-token.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailerService } from '../../services/mailer.service';

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

  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(EmailConfirmationToken) private emailTokenRepo: Repository<EmailConfirmationToken>,
    @InjectRepository(PasswordResetToken) private passwordTokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(RefreshToken) private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private mailer: MailerService
  ) {
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

  /** Genera token aleatorio seguro en formato hexadecimal. */
  private generateRawToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /** Hashea token plano con SHA-256. */
  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /** Tiempo actual + minutos. */
  private minutesFromNow(minutes: number): Date {
    return new Date(Date.now() + minutes * 60000);
  }

  /** Registro de usuario con estado PENDING_CONFIRMATION y envío de email de confirmación. */
  async register(email: string, password: string, fullName: string) {
    const existing = await this.usersRepo.findOne({ where: { correo: email.toLowerCase() } });
    if (existing) throw new BadRequestException('Correo ya registrado');

    const passwordHash = await this.hashPassword(password);
    let user = this.usersRepo.create({
      correo: email.toLowerCase(),
      nombreCompleto: fullName,
      passwordHash,
      estado: 'PENDING_CONFIRMATION'
    });
    user = await this.usersRepo.save(user);

    // Generar token confirmación
    const rawToken = this.generateRawToken(24);
    const tokenHash = this.hashToken(rawToken);
    const emailToken = this.emailTokenRepo.create({
      tokenHash,
      user,
      expiresAt: this.minutesFromNow(60), // 1 hora
    });
    await this.emailTokenRepo.save(emailToken);

    // Enviar email si Mailer habilitado
    const frontendBase = this.configService.get<string>('FRONTEND_URL') || 'https://lama-frontend';
    const confirmUrl = `${frontendBase}/auth/confirmar-email?token=${rawToken}`;
    if (this.mailer.isEnabled()) {
      await this.mailer.sendMail({
        to: user.correo,
        subject: 'Confirmación de correo - Fundación LAMA Medellín',
        html: `<h1>Confirmación de correo</h1><p>Hola ${fullName},</p><p>Por favor confirma tu correo haciendo clic en el siguiente enlace:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p><p>Este enlace expira en 60 minutos.</p>`
      });
    }
    return { id: user.id, correo: user.correo, estado: user.estado };
  }

  /** Confirma email con token plano. */
  async confirmEmail(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.emailTokenRepo.findOne({ where: { tokenHash }, relations: ['user'] });
    if (!record) throw new BadRequestException('Token inválido');
    if (record.used) throw new BadRequestException('Token ya utilizado');
    if (record.expiresAt < new Date()) throw new BadRequestException('Token expirado');

    const user = record.user;
    user.estado = 'ACTIVE';
    await this.usersRepo.save(user);
    record.used = true;
    await this.emailTokenRepo.save(record);
    return { confirmado: true, userId: user.id };
  }

  /** Login con email/password (solo usuarios ACTIVE). */
  async loginLocal(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { correo: email.toLowerCase() }, relations: ['roles'] });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (user.estado !== 'ACTIVE') throw new UnauthorizedException('Usuario no activo');
    if (!user.passwordHash || !(await this.comparePassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const accessToken = this.createAccessToken(user);
    const refresh = await this.issueRefreshToken(user);
    return { accessToken, refreshToken: refresh.raw, user: this.publicUser(user) };
  }

  /** Crea JWT de acceso. */
  private createAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.correo,
      roles: user.roles?.map(r => r.name) || [],
      capitulo: user.capitulo || null
    };
    return this.jwtService.sign(payload, { expiresIn: '20m' });
  }

  /** Emite refresh token persistiendo hash. */
  private async issueRefreshToken(user: User) {
    const raw = this.generateRawToken(32);
    const tokenHash = this.hashToken(raw);
    const record = this.refreshTokenRepo.create({
      tokenHash,
      user,
      expiresAt: this.minutesFromNow(60 * 24 * 15) // 15 días
    });
    await this.refreshTokenRepo.save(record);
    return { raw, recordId: record.id };
  }

  /** Endpoint refresh: rota refresh token y devuelve nuevo access+refresh. */
  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const record = await this.refreshTokenRepo.findOne({ where: { tokenHash }, relations: ['user'] });
    if (!record || record.revoked) throw new UnauthorizedException('Refresh token inválido');
    if (record.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expirado');
    const user = await this.usersRepo.findOne({ where: { id: record.user.id }, relations: ['roles'] });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    // Revocar token anterior
    record.revoked = true;
    await this.refreshTokenRepo.save(record);
    const accessToken = this.createAccessToken(user);
    const newRefresh = await this.issueRefreshToken(user);
    return { accessToken, refreshToken: newRefresh.raw };
  }

  /** Solicitud de recuperación de contraseña. */
  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { correo: email.toLowerCase() } });
    if (!user) throw new NotFoundException('Correo no registrado');
    const rawToken = this.generateRawToken(24);
    const tokenHash = this.hashToken(rawToken);
    const reset = this.passwordTokenRepo.create({
      tokenHash,
      user,
      expiresAt: this.minutesFromNow(30) // 30 minutos
    });
    await this.passwordTokenRepo.save(reset);
    const frontendBase = this.configService.get<string>('FRONTEND_URL') || 'https://lama-frontend';
    const resetUrl = `${frontendBase}/auth/reset-password?token=${rawToken}`;
    if (this.mailer.isEnabled()) {
      await this.mailer.sendMail({
        to: user.correo,
        subject: 'Recuperación de contraseña - Fundación LAMA Medellín',
        html: `<h1>Recuperación de contraseña</h1><p>Solicitaste restablecer tu contraseña.</p><p>Haz clic en: <a href="${resetUrl}">${resetUrl}</a></p><p>Expira en 30 minutos.</p>`
      });
    }
    return { enviado: true };
  }

  /** Reseteo de contraseña con token. */
  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.passwordTokenRepo.findOne({ where: { tokenHash }, relations: ['user'] });
    if (!record) throw new BadRequestException('Token inválido');
    if (record.used) throw new BadRequestException('Token ya utilizado');
    if (record.expiresAt < new Date()) throw new BadRequestException('Token expirado');
    const user = record.user;
    user.passwordHash = await this.hashPassword(newPassword);
    await this.usersRepo.save(user);
    record.used = true;
    await this.passwordTokenRepo.save(record);
    return { actualizado: true };
  }

  /** Representación pública del usuario. */
  private publicUser(user: User) {
    return {
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      correo: user.correo,
      roles: user.roles?.map(r => r.name) || [],
      estado: user.estado
    };
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
