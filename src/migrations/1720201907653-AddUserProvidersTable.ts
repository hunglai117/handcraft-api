import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProvidersTable1720201907653 implements MigrationInterface {
  name = "AddUserProvidersTable1720201907653";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for provider types
    await queryRunner.query(
      `CREATE TYPE "public"."user_providers_provider_enum" AS ENUM('google', 'facebook')`,
    );

    // Create user_providers table
    await queryRunner.query(`CREATE TABLE "user_providers" (
            "id" BIGINT NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "user_id" BIGINT NOT NULL,
            "provider" "public"."user_providers_provider_enum" NOT NULL,
            "provider_id" character varying(255) NOT NULL,
            "provider_data" json,
            "access_token" text,
            "refresh_token" text,
            "token_expires_at" TIMESTAMP,
            PRIMARY KEY ("id")
        )`);

    // Add indexes for faster querying
    await queryRunner.query(
      `CREATE INDEX "IDX_user_providers_user_id" ON "user_providers" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_provider_provider_id" ON "user_providers" ("provider", "provider_id")`,
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "user_providers" ADD CONSTRAINT "FK_user_providers_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Make user password nullable to support social login
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert password back to NOT NULL
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "user_providers" DROP CONSTRAINT "FK_user_providers_users"`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_provider_provider_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_providers_user_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "user_providers"`);

    // Drop enum type
    await queryRunner.query(
      `DROP TYPE "public"."user_providers_provider_enum"`,
    );
  }
}
