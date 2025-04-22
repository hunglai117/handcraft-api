import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePromotionsTable1713337200400 implements MigrationInterface {
  name = "CreatePromotionsTable1713337200400";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create promotion type enum
    await queryRunner.query(`
      CREATE TYPE "promotion_type_enum" AS ENUM (
        'PERCENTAGE_DISCOUNT', 
        'FIXED_AMOUNT_DISCOUNT', 
        'FREE_SHIPPING', 
        'BUY_X_GET_Y_FREE'
      )
    `);

    // Create promotions table
    await queryRunner.query(`
      CREATE TABLE "promotions" (
        "id" BIGINT NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "promo_code" character varying(50),
        "type" "promotion_type_enum" NOT NULL DEFAULT 'PERCENTAGE_DISCOUNT',
        "discount_value" decimal(10,2) NOT NULL DEFAULT 0.00,
        "minimum_order_amount" decimal(10,2),
        "start_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "end_date" TIMESTAMP,
        "usage_limit" integer,
        "usage_limit_per_user" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_promotions_promo_code" UNIQUE ("promo_code"),
        CONSTRAINT "PK_promotions" PRIMARY KEY ("id")
      )
    `);

    // Create trigger for automatically updating updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER set_timestamp
      BEFORE UPDATE ON "promotions"
      FOR EACH ROW
      EXECUTE FUNCTION trigger_set_timestamp();
    `);

    // Create index on promo_code for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_promotions_promo_code ON "promotions" (promo_code);
    `);

    // Create index for finding active promotions
    await queryRunner.query(`
      CREATE INDEX idx_promotions_active_dates ON "promotions" (is_active, start_date, end_date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_promotions_active_dates"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_promotions_promo_code"`);
    
    // Drop trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS "set_timestamp" ON "promotions"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS "trigger_set_timestamp()"`);
    
    // Drop promotions table
    await queryRunner.query(`DROP TABLE IF EXISTS "promotions"`);
    
    // Drop types
    await queryRunner.query(`DROP TYPE IF EXISTS "promotion_type_enum"`);
  }
}
