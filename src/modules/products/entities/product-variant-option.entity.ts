import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { ProductVariant } from "./product-variant.entity";
import { ProductOption } from "./product-option.entity";

@Entity("product_variant_options")
export class ProductVariantOption extends BaseEntity {
  @Column({ type: "bigint", nullable: false })
  variant_id: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.variantOptions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "variant_id" })
  variant: ProductVariant;

  @Column({ type: "bigint", nullable: false })
  option_id: string;

  @ManyToOne(() => ProductOption, (option) => option.variantOptions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "option_id" })
  option: ProductOption;

  @Column({ length: 100, nullable: false })
  value: string;
}
