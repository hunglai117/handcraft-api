import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Order } from "./order.entity";
import { Promotion } from "../../promotions/entities/promotion.entity";

@Entity("order_promotions")
export class OrderPromotion extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.orderPromotions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "bigint", nullable: true, name: "promotion_id" })
  promotionId: string;

  @ManyToOne(() => Promotion, { onDelete: "SET NULL" })
  @JoinColumn({ name: "promotion_id" })
  promotion: Promotion;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: false,
    name: "discount_amount",
  })
  discountAmount: number;
}
