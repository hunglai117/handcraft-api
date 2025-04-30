import { MigrationInterface, QueryRunner } from "typeorm";

export class Modify1746000304493 implements MigrationInterface {
  name = "Modify1746000304493";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_providers" RENAME COLUMN "provider_id" TO "provider_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "inStock" TO "in_stock"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "in_stock" TO "inStock"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_providers" RENAME COLUMN "provider_user_id" TO "provider_id"`,
    );
  }
}
