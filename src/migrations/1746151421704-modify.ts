import { MigrationInterface, QueryRunner } from "typeorm";

export class Modify1746151421704 implements MigrationInterface {
  name = "Modify1746151421704";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD "usage_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ALTER COLUMN "end_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ALTER COLUMN "usage_limit" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions" ALTER COLUMN "usage_limit" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ALTER COLUMN "end_date" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN "usage_count"`,
    );
  }
}
