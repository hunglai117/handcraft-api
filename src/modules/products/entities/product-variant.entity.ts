import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Product } from "./product.entity";
import { ProductVariantOption } from "./product-variant-option.entity";

@Entity("product_variants")
export class ProductVariant extends BaseEntity {
  @Column({ name: "product_id", type: "bigint", nullable: false })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: false })
  price: number;

  @Column({ length: 50, nullable: true })
  sku: string;

  @Column({ default: 0, name: "stock_quantity" })
  stockQuantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ type: "text", nullable: true })
  image: string;

  @OneToMany(
    () => ProductVariantOption,
    (variantOption) => variantOption.variant,
    { cascade: true },
  )
  variantOptions: ProductVariantOption[];

  @Column({ default: 0, name: "purchase_count" })
  purchaseCount: number;
}
