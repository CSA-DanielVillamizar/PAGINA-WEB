import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { User } from '../users/user.entity';
import { EmailConfirmationToken } from './email-confirmation-token.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { MailerService } from '../../services/mailer.service';

/**
 * Módulo de autenticación que integra Microsoft Entra ID (Azure AD) con JWT.
 * Provee estrategia Passport, guards, y servicios de autenticación.
 */
@Module({
  imports: [
  TypeOrmModule.forFeature([User, EmailConfirmationToken, PasswordResetToken, RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'lama-secret-key-2024',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailerService],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
