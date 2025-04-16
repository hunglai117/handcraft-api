import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1718542100000 implements MigrationInterface {
  name = "CreateUsersTable1718542100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "first_name" character varying(50) NOT NULL,
        "last_name" character varying(50) NOT NULL,
        "email" character varying(100) NOT NULL,
        "password" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "phone" character varying,
        "address" character varying(255),
        "city" character varying(100),
        "state" character varying(200),
        "zip" character varying(20),
        "country" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
