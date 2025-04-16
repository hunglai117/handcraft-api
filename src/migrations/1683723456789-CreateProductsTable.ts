import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1683723456789 implements MigrationInterface {
  name = "CreateProductsTable1683723456789";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "products" (
                "productID" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "description" text,
                "price" numeric(10,2) NOT NULL,
                "imageURL" character varying(2083),
                "materials" text,
                "availability" boolean NOT NULL DEFAULT true,
                "category" character varying(100),
                "shippingInfo" text,
                "taxInfo" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_4deb055650987ec5b25591480d3" PRIMARY KEY ("productID")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
