import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { ProductVariant } from "./product-variant.entity";
import { ProductOption } from "./product-option.entity";

@Entity("product_variant_options")
export class ProductVariantOption extends BaseEntity {
  @Column({ name: "variant_id", type: "bigint", nullable: false })
  variantId: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.variantOptions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "variant_id" })
  variant: ProductVariant;

  @Column({ name: "option_id", type: "bigint", nullable: false })
  optionId: string;

  @ManyToOne(() => ProductOption, (option) => option.variantOptions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "option_id" })
  option: ProductOption;

  @Column({ name: "order_index", type: "int", nullable: false })
  orderIndex: number;

  @Column({ length: 100, nullable: false })
  value: string;
}
