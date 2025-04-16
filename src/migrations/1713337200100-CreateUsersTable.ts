import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1713337200100 implements MigrationInterface {
  name = "CreateUsersTable1713337200100";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('user', 'admin')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" BIGINT NOT NULL,
        "first_name" character varying(50) NOT NULL,
        "last_name" character varying(50) NOT NULL,
        "email" character varying(100) NOT NULL,
        "password" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'user',
        "phone" character varying,
        "address" character varying(255),
        "city" character varying(100),
        "state" character varying(100),
        "zip" character varying(20),
        "country" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop users table
    await queryRunner.query(`
      DROP TABLE "users"
    `);
    await queryRunner.query(`
      DROP TYPE "users_role_enum"
    `);
  }
}
