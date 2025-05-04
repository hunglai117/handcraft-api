import { MigrationInterface, QueryRunner } from "typeorm";

export class Modify1746337531767 implements MigrationInterface {
  name = "Modify1746337531767";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP COLUMN "purchase_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "purchase_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "rating" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "rating"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "purchase_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD "purchase_count" integer NOT NULL DEFAULT '0'`,
    );
  }
}
