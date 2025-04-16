import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  UpdateDateColumn,
} from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Category } from "../../categories/entities/category.entity";
import { Product } from "../../products/entities/product.entity";

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

export enum TargetScope {
  ALL = "all",
  CATEGORY = "category",
  PRODUCT = "product",
}

@Entity("promotions")
export class Promotion extends BaseEntity {
  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 50, nullable: true, unique: true })
  code: string;

  @Column({
    type: "enum",
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
    name: "discount_type",
  })
  discountType: DiscountType;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: false,
    name: "discount_value",
  })
  discountValue: number;

  @Column({ type: "timestamp", name: "start_date" })
  startDate: Date;

  @Column({ type: "timestamp", name: "end_date" })
  endDate: Date;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
    name: "min_order_value",
  })
  minOrderValue: number;

  @Column({
    type: "enum",
    enum: TargetScope,
    default: TargetScope.ALL,
    name: "target_scope",
  })
  targetScope: TargetScope;

  @Column({ nullable: true, name: "usage_limit" })
  usageLimit: number;

  @Column({ nullable: true, name: "usage_limit_per_user" })
  usageLimitPerUser: number;

  @Column({ default: true, name: "is_active" })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToMany(() => Category)
  @JoinTable({
    name: "promotion_categories",
    joinColumn: {
      name: "promotion_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "fk_promotion_categories_promotion_id",
    },
    inverseJoinColumn: {
      name: "category_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "fk_promotion_categories_category_id",
    },
  })
  categories: Category[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: "promotion_products",
    joinColumn: {
      name: "promotion_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "fk_promotion_products_promotion_id",
    },
    inverseJoinColumn: {
      name: "product_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "fk_promotion_products_product_id",
    },
  })
  products: Product[];
}
