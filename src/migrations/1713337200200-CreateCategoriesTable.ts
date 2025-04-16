import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoriesTable1713337200200 implements MigrationInterface {
  name = "CreateCategoriesTable1713337200200";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" BIGINT NOT NULL,
        "name" character varying(255) NOT NULL,
        "path_url" character varying(255) NOT NULL,
        "parent_id" BIGINT,
        "is_leaf" boolean NOT NULL DEFAULT true,
        "products_count" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parent_id"
      FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop categories table
    await queryRunner.query(`
      ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parent_id"
    `);
    await queryRunner.query(`
      DROP TABLE "categories"
    `);
  }
}
