import { MigrationInterface, QueryRunner } from "typeorm";

export class Modify1746015722907 implements MigrationInterface {
  name = "Modify1746015722907";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "billing_info"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD "billing_info" jsonb`);
  }
}
