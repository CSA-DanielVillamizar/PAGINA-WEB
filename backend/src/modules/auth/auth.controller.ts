import { Controller, Post, Body, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controlador de autenticación con Microsoft Entra ID multi-tenant.
 * Permite usuarios de dominio externo y marca flag external en payload.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Get('login-url')
  @ApiOperation({ summary: 'Obtener URL de login de Microsoft (multi-tenant)' })
  async getLoginUrl() {
    const url = await this.authService.getAuthorizationUrl();
    return { url };
  }

  @Post('callback')
  @ApiOperation({ summary: 'Callback OAuth2 Microsoft: intercambio code por token' })
  async callback(@Body('code') code: string) {
    if (!code) throw new BadRequestException('Falta parámetro code');

    const msalResponse = await this.authService.acquireTokenByCode(code);
    const azureUser = await this.authService.validateAzureToken(msalResponse.accessToken);

    let user = await this.usersRepository.findOne({
      where: { correo: azureUser.email },
      relations: ['roles'],
    });

    if (!user) {
      user = this.usersRepository.create({
        correo: azureUser.email,
        nombreCompleto: azureUser.name,
        estado: 'ACTIVE'
      });
      user = await this.usersRepository.save(user);
    }

    const payload = {
      sub: user.id,
      email: user.correo,
      roles: user.roles?.map(r => r.name) || [],
      external: azureUser.external
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        nombreCompleto: user.nombreCompleto,
        correo: user.correo,
        roles: user.roles,
        external: azureUser.external
      }
    };
  }

  // ---------------------- NUEVOS ENDPOINTS AUTENTICACIÓN LOCAL ----------------------

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuario local con confirmación de email' })
  async register(@Body() body: { email: string; password: string; fullName: string }) {
    const { email, password, fullName } = body;
    if (!email || !password || !fullName) throw new BadRequestException('email, password y fullName son requeridos');
    return this.authService.register(email, password, fullName);
  }

  @Post('confirm-email')
  @ApiOperation({ summary: 'Confirmar email con token' })
  async confirmEmail(@Body('token') token: string) {
    if (!token) throw new BadRequestException('Falta token');
    return this.authService.confirmEmail(token);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login local con email y password' })
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) throw new BadRequestException('email y password requeridos');
    return this.authService.loginLocal(email, password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar sesión con refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Falta refreshToken');
    return this.authService.refresh(refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Falta email');
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña mediante token' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const { token, newPassword } = body;
    if (!token || !newPassword) throw new BadRequestException('token y newPassword requeridos');
    return this.authService.resetPassword(token, newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Usuario actual y sus roles' })
  async getCurrentUser(@CurrentUser() user: User) {
    return {
      id: user.id,
      nombreCompleto: user.nombreCompleto,
      correo: user.correo,
      roles: user.roles,
    };
  }
}
