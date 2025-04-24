import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

export enum PromotionType {
  PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT",
  FIXED_AMOUNT_DISCOUNT = "FIXED_AMOUNT_DISCOUNT",
  FREE_SHIPPING = "FREE_SHIPPING",
  BUY_X_GET_Y_FREE = "BUY_X_GET_Y_FREE",
}

@Entity("promotions")
export class Promotion extends BaseEntity {
  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 50, nullable: true, unique: true, name: "promo_code" })
  promoCode: string;

  @Column({
    type: "enum",
    enum: PromotionType,
    default: PromotionType.PERCENTAGE_DISCOUNT,
    name: "type",
  })
  type: PromotionType;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0.0,
    name: "discount_value",
  })
  discountValue: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    name: "minimum_order_amount",
  })
  minimumOrderAmount: number;

  @Column({
    type: "timestamp",
    name: "start_date",
    default: () => "CURRENT_TIMESTAMP",
  })
  startDate: Date;

  @Column({
    type: "timestamp",
    name: "end_date",
    nullable: true,
  })
  endDate: Date;

  @Column({ default: true, name: "is_active" })
  isActive: boolean;

  @Column({ nullable: true, name: "usage_limit" })
  usageLimit: number;

  @Column({ nullable: true, name: "usage_limit_per_user" })
  usageLimitPerUser: number;
}
