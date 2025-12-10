import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
// ENTIDADES (solo las necesarias para repos en módulos Nest)
import { User } from './modules/users/user.entity'
import { Role } from './modules/roles/role.entity'
import { MemberProfile } from './modules/members/member-profile.entity'
import { Event } from './modules/events/event.entity'
import { Donation } from './modules/donations/donation.entity'
import { News } from './modules/news/news.entity'
import { Souvenir } from './modules/souvenirs/souvenir.entity'
import { Subscription } from './modules/subscriptions/subscription.entity'
import { Vehicle } from './modules/vehicles/vehicle.entity'
import { ApplicationForm } from './modules/forms/application-form.entity'
import { GalleryAlbum } from './modules/gallery/gallery.entity'
import { EmailConfirmationToken } from './modules/auth/email-confirmation-token.entity'
import { PasswordResetToken } from './modules/auth/password-reset-token.entity'
import { RefreshToken } from './modules/auth/refresh-token.entity'
import { FeaturedProject } from './modules/projects/entities/featured-project.entity'

// MÓDULOS
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

/**
 * Normaliza el usuario de conexión eliminando el sufijo '@servidor'.
 * Se usa tanto en TypeORM como en runner de migraciones.
 */
function normalizeUser(u?: string) {
  if (!u) return 'pgadmin'
  return u.includes('@') ? u.split('@')[0] : u
}

/**
 * Genera la configuración de TypeORM. Si DISABLE_DB=1 devuelve una config "stub" para
 * permitir que la aplicación arranque sin base de datos (health check, endpoints estáticos, etc.).
 */
function buildTypeOrmConfig() {
  const disable = process.env.DISABLE_DB === '1'
  if (disable) {
    return {
      type: 'sqlite' as const,
      database: ':memory:',
      entities: [],
      synchronize: false,
      logging: false,
    }
  }
  return {
    type: 'postgres' as const,
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
    // Solo entidades realmente usadas por Nest (migraciones quedan en data-source independiente)
    entities: [
      User,
      Role,
      MemberProfile,
      Event,
      Donation,
      News,
      Souvenir,
      Subscription,
      Vehicle,
      ApplicationForm,
      GalleryAlbum,
      EmailConfirmationToken,
      PasswordResetToken,
      RefreshToken,
      FeaturedProject,
    ],
    synchronize: false,
    logging: false,
    autoLoadEntities: false,
    retryAttempts: 3,
    retryDelay: 3000,
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildTypeOrmConfig()),
    // MÓDULOS BÁSICOS (sin DB obligatoria)
    HealthModule,
    DiagnosticsModule,
    InscriptionsModule,
    // MÓDULOS CON DB
    ProjectsModule,
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
