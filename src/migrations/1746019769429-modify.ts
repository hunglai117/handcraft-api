import { MigrationInterface, QueryRunner } from "typeorm";

export class Modify1746019769429 implements MigrationInterface {
  name = "Modify1746019769429";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" ADD "notes" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "notes"`);
  }
}
