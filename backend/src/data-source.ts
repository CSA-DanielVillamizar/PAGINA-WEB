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

// Importar migraciones existentes
import { InitialSchema1700000000000 } from './migrations/1700000000000-InitialSchema'

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
  entities: [User, Role, MemberProfile, Event, Donation, News, Souvenir, Subscription, Vehicle, ApplicationForm, GalleryAlbum],
  migrations: [InitialSchema1700000000000],
  synchronize: false,
  logging: false,
})

export default AppDataSource
