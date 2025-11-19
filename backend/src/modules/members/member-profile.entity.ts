import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

/**
 * Entidad Perfil de Miembro
 * Representa información extendida de los miembros de la fundación
 */
@Entity('member_profiles')
export class MemberProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  membershipNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  chapter: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  membershipType: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  memberSince: Date;

  @Column({ type: 'timestamp', nullable: true })
  renewalDate: Date;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: Record<string, string>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profileImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
