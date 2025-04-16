import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "../../categories/entities/category.entity";
import { BaseEntity } from "../../../common/entities/base.entity";

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

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  price: number;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: false,
    name: "original_price",
  })
  originalPrice: number;

  @Column({ length: 3, default: "VND" })
  currency: string;

  @Column({ default: 0, name: "stock_quantity" })
  stockQuantity: number;

  @Column({ length: 100, nullable: true, unique: true })
  sku: string;

  @Column({ type: "simple-array", nullable: true })
  images: string[];

  @Column({ type: "json", nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specifications: Record<string, any>;

  @Column({ type: "simple-array", nullable: true })
  tags: string[];

  @Column({ default: true, name: "is_active" })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ type: "float", default: 0 })
  rating: number;

  @Column({ default: 0, name: "review_count" })
  reviewCount: number;

  @Column({ type: "simple-array", nullable: true, name: "related_product_ids" })
  relatedProductIds: string[];

  @Column({ default: 0, name: "purchase_count" })
  purchaseCount: number;
}
