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
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module'
import { InscriptionsModule } from './modules/inscriptions/inscriptions.module'
import { ProjectsModule } from './modules/projects/projects.module'
import AppDataSource from './data-source'

/**
 * Normaliza el usuario de conexión eliminando el sufijo '@servidor' si existe.
 */
function normalizeUser(u?: string) {
  if (!u) return 'pgadmin'
  return u.includes('@') ? u.split('@')[0] : u
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // TypeORM con configuración resiliente: tolerancia a fallos, reintentos, y modo condicional.
    // Si DISABLE_DB=1, se omite la conexión (la app arranca sin DB).
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: normalizeUser(process.env.DB_USER),
      password: process.env.DB_PASS || process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: (process.env.NODE_ENV === 'production' || process.env.DB_SSL === '1')
        ? { rejectUnauthorized: false }
        : false,
      connectTimeoutMS: 15000,
      extra: {
        connectionTimeoutMillis: 15000,
        query_timeout: 30000,
        statement_timeout: 30000,
      },
      entities: AppDataSource.options.entities,
      synchronize: false,
      logging: false,
      autoLoadEntities: false,
    }),
    // MÓDULOS BÁSICOS sin dependencia de DB
    HealthModule,
    DiagnosticsModule,
    InscriptionsModule,
    // MÓDULOS CON DB
    ProjectsModule, // CRUD proyectos destacados (solo junta)
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
    AdminModule,
  ],
})
export class AppModule {}
