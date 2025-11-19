import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm'
import { User } from '../users/user.entity'

/**
 * Entidad Role
 * Representa un rol del sistema (RBAC) y se asocia de forma ManyToMany con usuarios.
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  name: string

  @Column({ nullable: true })
  description?: string

  /** Usuarios que poseen este rol */
  @ManyToMany(() => User, user => user.roles)
  users: User[]
}
