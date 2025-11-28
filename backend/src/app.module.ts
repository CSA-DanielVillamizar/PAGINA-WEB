import { Module } from '@nestjs/common'
// Se elimina TypeOrmModule.forRootAsync para evitar bloqueo en el arranque.
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Configuración de TypeORM con tolerancia a fallos y reintentos.
    // Si se establece DISABLE_DB=1 en las variables de entorno, se omite la conexión
    // para permitir que la aplicación arranque y exponga endpoints básicos.
    // MÓDULOS BÁSICOS: El arranque nunca debe bloquearse por la base de datos.
    // Los módulos que dependen de repositorios se habilitarán cuando se reintroduzca TypeOrmModule.
    HealthModule,
    DiagnosticsModule,
    InscriptionsModule,
    ProjectsModule, // CRUD proyectos destacados (solo junta)
  ],
})
export class AppModule {}
