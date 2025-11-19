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
