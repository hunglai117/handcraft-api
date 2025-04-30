import { MigrationInterface, QueryRunner } from "typeorm";

export class Modify1746000734145 implements MigrationInterface {
  name = "Modify1746000734145";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_options" DROP COLUMN "order_index"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_options" ADD "order_index" integer NOT NULL`,
    );
  }
}
