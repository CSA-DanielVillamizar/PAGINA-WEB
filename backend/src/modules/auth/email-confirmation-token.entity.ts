import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

/**
 * Entidad EmailConfirmationToken
 * Almacena tokens de confirmación de correo electrónico para nuevos registros.
 * Se guarda el hash del token (no el token plano) para seguridad.
 * El token expira después de cierto tiempo (expiration). Un token usado se marca como used=true.
 */
@Entity('email_confirmation_tokens')
export class EmailConfirmationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Hash del token (sha256). El valor plano se envía por email y no se almacena. */
  @Column({ length: 128 })
  @Index({ unique: true })
  tokenHash: string;

  /** Fecha y hora de expiración del token. */
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  /** Indica si el token ya fue utilizado para confirmar el correo. */
  @Column({ default: false })
  used: boolean;

  /** Relación con el usuario al que pertenece este token. */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
