import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePromotionsTable1713337200400 implements MigrationInterface {
  name = "CreatePromotionsTable1713337200400";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create discount type and target scope enums for promotions
    await queryRunner.query(`
      CREATE TYPE "promotions_discount_type_enum" AS ENUM ('percentage', 'fixed_amount')
    `);

    await queryRunner.query(`
      CREATE TYPE "promotions_target_scope_enum" AS ENUM ('all', 'category', 'product')
    `);

    // Create promotions table
    await queryRunner.query(`
      CREATE TABLE "promotions" (
        "id" BIGINT NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "code" character varying(50),
        "discount_type" "promotions_discount_type_enum" NOT NULL DEFAULT 'percentage',
        "discount_value" decimal(15,2) NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "min_order_value" decimal(15,2),
        "target_scope" "promotions_target_scope_enum" NOT NULL DEFAULT 'all',
        "usage_limit" integer,
        "usage_limit_per_user" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_promotions_code" UNIQUE ("code"),
        CONSTRAINT "PK_promotions" PRIMARY KEY ("id")
      )
    `);

    // Create promotion_categories junction table
    await queryRunner.query(`
      CREATE TABLE "promotion_categories" (
        "promotion_id" BIGINT NOT NULL,
        "category_id" BIGINT NOT NULL,
        CONSTRAINT "PK_promotion_categories" PRIMARY KEY ("promotion_id", "category_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "promotion_categories" 
      ADD CONSTRAINT "fk_promotion_categories_promotion_id" 
      FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "promotion_categories" 
      ADD CONSTRAINT "fk_promotion_categories_category_id" 
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Create promotion_products junction table
    await queryRunner.query(`
      CREATE TABLE "promotion_products" (
        "promotion_id" BIGINT NOT NULL,
        "product_id" BIGINT NOT NULL,
        CONSTRAINT "PK_promotion_products" PRIMARY KEY ("promotion_id", "product_id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "promotion_products" 
      ADD CONSTRAINT "fk_promotion_products_promotion_id" 
      FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "promotion_products" 
      ADD CONSTRAINT "fk_promotion_products_product_id" 
      FOREIGN KEY ("product_id") REFERENCES "products"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop promotion_products junction table
    await queryRunner.query(`
      ALTER TABLE "promotion_products" DROP CONSTRAINT "fk_promotion_products_product_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "promotion_products" DROP CONSTRAINT "fk_promotion_products_promotion_id"
    `);
    await queryRunner.query(`
      DROP TABLE "promotion_products"
    `);

    // Drop promotion_categories junction table
    await queryRunner.query(`
      ALTER TABLE "promotion_categories" DROP CONSTRAINT "fk_promotion_categories_category_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "promotion_categories" DROP CONSTRAINT "fk_promotion_categories_promotion_id"
    `);
    await queryRunner.query(`
      DROP TABLE "promotion_categories"
    `);

    // Drop promotions table
    await queryRunner.query(`
      DROP TABLE "promotions"
    `);
    await queryRunner.query(`
      DROP TYPE "promotions_target_scope_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "promotions_discount_type_enum"
    `);
  }
}
