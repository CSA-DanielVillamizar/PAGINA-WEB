import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: creación de tablas para tokens de autenticación (confirmación email, reset password, refresh tokens).
 */
export class AuthTokens1700000001000 implements MigrationInterface {
  name = 'AuthTokens1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "email_confirmation_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tokenHash" varchar(128) UNIQUE NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "userId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_email_conf_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tokenHash" varchar(128) UNIQUE NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "userId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_pwd_reset_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tokenHash" varchar(128) UNIQUE NOT NULL,
        "expiresAt" timestamptz NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "userId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_refresh_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "refresh_tokens"');
    await queryRunner.query('DROP TABLE IF EXISTS "password_reset_tokens"');
    await queryRunner.query('DROP TABLE IF EXISTS "email_confirmation_tokens"');
  }
}
