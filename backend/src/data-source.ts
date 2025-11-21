import 'reflect-metadata'
import { DataSource } from 'typeorm'
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

// Importar todas las migraciones
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema'
import { AuthTokens1700000001000 } from './migrations/1700000001000-AuthTokens'
import { VehicleEnhancements1700000002000 } from './migrations/1700000002000-VehicleEnhancements'
import { EventEnhancements1700000003000 } from './migrations/1700000003000-EventEnhancements'
import { DonationEnhancements1700000004000 } from './migrations/1700000004000-DonationEnhancements'
import { GalleryEnhancements1700000005000 } from './migrations/1700000005000-GalleryEnhancements'
import { NewsEnhancements1700000006000 } from './migrations/1700000006000-NewsEnhancements'
import { SubscriptionEnhancements1700000007000 } from './migrations/1700000007000-SubscriptionEnhancements'
import { SouvenirEnhancements1700000008000 } from './migrations/1700000008000-SouvenirEnhancements'

function normalizeUser(u?: string) {
  if (!u) return 'pgadmin'
  return u.includes('@') ? u.split('@')[0] : u
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: normalizeUser(process.env.DB_USER),
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: (process.env.NODE_ENV === 'production' || process.env.DB_SSL === '1') 
    ? { rejectUnauthorized: false } 
    : false,
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
    RefreshToken
  ],
  migrations: [
    InitialSchema1700000000000,
    AuthTokens1700000001000,
    VehicleEnhancements1700000002000,
    EventEnhancements1700000003000,
    DonationEnhancements1700000004000,
    GalleryEnhancements1700000005000,
    NewsEnhancements1700000006000,
    SubscriptionEnhancements1700000007000,
    SouvenirEnhancements1700000008000
  ],
  synchronize: false,
  logging: false,
})

export default AppDataSource
