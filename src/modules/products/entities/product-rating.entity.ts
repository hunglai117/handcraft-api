import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Product } from "./product.entity";
import { User } from "../../users/entities/user.entity";

@Entity("product_ratings")
export class ProductRating extends BaseEntity {
  @Column({ name: "product_id", type: "bigint", nullable: false })
  productId: string;

  @ManyToOne(() => Product, (product) => product.ratings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  userId: string;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: false })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string;

  @Column({ default: false, name: "is_verified_purchase" })
  isVerifiedPurchase: boolean;

  @Column({ default: 0, name: "helpful_count" })
  helpfulCount: number;

  @Column({ default: 0, name: "report_count" })
  reportCount: number;
}
