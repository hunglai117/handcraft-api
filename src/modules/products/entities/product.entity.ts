import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { BaseEntity } from "../../../common/entities/base.entity";
import { ProductVariant } from "./product-variant.entity";
import { ProductOption } from "./product-option.entity";

@Entity("products")
export class Product extends BaseEntity {
  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, nullable: false, unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "bigint", nullable: true })
  category_id: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Column({ length: 10, default: "VND" })
  currency: string;

  @Column({ type: "jsonb", nullable: true })
  images: string[];

  @Column({ length: 255, nullable: true, name: "featured_image" })
  featuredImage: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
    name: "price_min",
  })
  priceMin: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
    name: "price_max",
  })
  priceMax: number;

  @Column({ type: "boolean", default: true, name: "in_stock" })
  inStock: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductOption, (option) => option.product, { cascade: true })
  options: ProductOption[];

  @Column({ default: 0, name: "purchase_count" })
  purchaseCount: number;

  @Column({ default: 0 })
  rating: number;
}
