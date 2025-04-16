import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1713337200300 implements MigrationInterface {
  name = "CreateProductsTable1713337200300";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" BIGINT NOT NULL,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text,
        "category_id" BIGINT,
        "price" decimal(15,2) NOT NULL,
        "original_price" decimal(15,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'VND',
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "sku" character varying(100),
        "images" text,
        "specifications" json,
        "tags" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "rating" float NOT NULL DEFAULT 0,
        "review_count" integer NOT NULL DEFAULT 0,
        "related_product_ids" text,
        "purchase_count" integer NOT NULL DEFAULT 0,
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "products" ADD CONSTRAINT "FK_products_category_id"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop products table
    await queryRunner.query(`
      ALTER TABLE "products" DROP CONSTRAINT "FK_products_category_id"
    `);
    await queryRunner.query(`
      DROP TABLE "products"
    `);
  }
}
