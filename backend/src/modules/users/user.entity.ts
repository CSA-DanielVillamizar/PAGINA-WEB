import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm'
import { Role } from '../roles/role.entity'

/**
 * Entidad User
 * Almacena credenciales básicas y relación con roles.
 * NOTA: Las contraseñas se almacenan hasheadas (bcrypt). Para login MSAL se valida dominio.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  nombreCompleto: string

  @Column({ unique: true })
  correo: string

  @Column({ nullable: true })
  passwordHash?: string

  @Column({ default: 'ACTIVE' })
  estado: string

  // Propiedades adicionales para reportes
  @Column({ nullable: true })
  usuario?: string

  @Column({ nullable: true })
  telefono?: string

  @Column({ nullable: true })
  genero?: string

  @Column({ nullable: true })
  capitulo?: string

  @CreateDateColumn()
  fechaRegistro: Date

  @ManyToMany(() => Role, role => role.users, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[]
}
