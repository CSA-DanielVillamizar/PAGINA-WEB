import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RolesModule } from './modules/roles/roles.module'
import { MembersModule } from './modules/members/members.module'
import { VehiclesModule } from './modules/vehicles/vehicles.module'
import { EventsModule } from './modules/events/events.module'
import { SouvenirsModule } from './modules/souvenirs/souvenirs.module'
import { NewsModule } from './modules/news/news.module'
import { DonationsModule } from './modules/donations/donations.module'
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module'
import { GalleryModule } from './modules/gallery/gallery.module'
import { FormsModule } from './modules/forms/forms.module'
import { ReportsModule } from './modules/reports/reports.module'
import { HealthModule } from './modules/health/health.module'
import { AdminModule } from './modules/admin/admin.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Configuración de TypeORM con tolerancia a fallos y reintentos.
    // Si se establece DISABLE_DB=1 en las variables de entorno, se omite la conexión
    // para permitir que la aplicación arranque y exponga endpoints básicos.
    ...(process.env.DISABLE_DB === '1'
      ? []
      : [
          TypeOrmModule.forRootAsync({
            useFactory: () => {
              // Diagnósticos de entorno antes de construir la config
              const rawUser = process.env.DB_USER || 'user'
              const rawPass = process.env.DB_PASS || 'pass'
              const rawHost = process.env.DB_HOST || 'localhost'

              // Flexible Server NO requiere el patrón usuario@servidor (ese era para Single Server).
              // Si el usuario viene con sufijo, lo normalizamos.
              const normalizedUser = rawUser.includes('@') ? rawUser.split('@')[0] : rawUser

              // Detectar si la referencia de Key Vault no ha sido resuelta (contiene la sintaxis @Microsoft.KeyVault()).
              const keyVaultUnresolved = /@Microsoft\.KeyVault\(/i.test(rawPass)

              if (keyVaultUnresolved) {
                // Advertencia: la referencia no fue sustituida aún. Esto hará fallar la conexión.
                // No exponemos la contraseña, solo el estado.
                // eslint-disable-next-line no-console
                console.warn('[DB Diagnostics] La referencia de Key Vault para DB_PASS no se resolvió. Valor crudo presente. Revisar identidad y permisos RBAC.')
              }

              // eslint-disable-next-line no-console
              console.log('[DB Diagnostics] Intentando conexión PostgreSQL', {
                host: rawHost,
                user: normalizedUser,
                kvResolved: !keyVaultUnresolved,
                prod: process.env.NODE_ENV === 'production'
              })

              return {
                type: 'postgres',
                host: rawHost,
                port: parseInt(process.env.DB_PORT || '5432'),
                username: normalizedUser,
                password: rawPass,
                database: process.env.DB_NAME || 'lama_db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: false, // Desactivar en despliegues; usar migrations posteriormente
                retryAttempts: 5,
                retryDelay: 3000,
                autoLoadEntities: true,
                // SSL requerido para Azure PostgreSQL Flexible Server
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
              }
            }
          })
        ]),
    AuthModule,
    UsersModule,
    RolesModule,
    MembersModule,
    VehiclesModule,
    EventsModule,
    SouvenirsModule,
    NewsModule,
    DonationsModule,
    SubscriptionsModule,
    GalleryModule,
    FormsModule,
    ReportsModule,
    HealthModule,
    AdminModule,
  ],
})
export class AppModule {}
