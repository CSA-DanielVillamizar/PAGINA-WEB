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
            useFactory: () => ({
              type: 'postgres',
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT || '5432'),
              username: process.env.DB_USER || 'user',
              password: process.env.DB_PASS || 'pass',
              database: process.env.DB_NAME || 'lama_db',
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: false, // Desactivar en despliegues; usar migrations posteriormente
              retryAttempts: 5,
              retryDelay: 3000,
              autoLoadEntities: true,
              // SSL requerido para Azure PostgreSQL Flexible Server
              ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            })
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
  ],
})
export class AppModule {}
