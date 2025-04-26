import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Product } from "./product.entity";
import { ProductVariantOption } from "./product-variant-option.entity";

@Entity("product_options")
export class ProductOption extends BaseEntity {
  @Column({ name: "product_id", type: "bigint", nullable: false })
  productId: string;

  @ManyToOne(() => Product, (product) => product.options, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ name: "order_index", type: "int" })
  orderIndex: number;

  @OneToMany(
    () => ProductVariantOption,
    (variantOption) => variantOption.option,
    { cascade: true },
  )
  variantOptions: ProductVariantOption[];
}
