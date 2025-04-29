/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { OrderStatus } from "./order-status.enum";
import { OrderItem } from "./order-item.entity";
import { OrderPromotion } from "./order-promotion.entity";
import { PaymentStatus } from "src/modules/payment/enums/payment-status.enum";
import { PaymentTransaction } from "src/modules/payment/entities/payment-transaction.entity";

@Entity("orders")
export class Order extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "user_id" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    length: 50,
    default: OrderStatus.PENDING,
    name: "order_status",
  })
  orderStatus: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: false,
    name: "total_amount",
  })
  totalAmount: number;

  @Column({
    length: 50,
    default: PaymentStatus.PENDING,
    name: "payment_status",
  })
  paymentStatus: string;

  @Column({ type: "jsonb", nullable: true, name: "shipping_info" })
  shippingInfo: Record<string, any>;

  @Column({ type: "jsonb", nullable: true, name: "billing_info" })
  billingInfo: Record<string, any>;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  orderItems: OrderItem[];

  @OneToMany(() => OrderPromotion, (orderPromotion) => orderPromotion.order, {
    cascade: true,
    eager: true,
  })
  orderPromotions: OrderPromotion[];

  @OneToMany(
    () => PaymentTransaction,
    (paymentTransaction) => paymentTransaction.order,
    {
      cascade: true,
      eager: true,
    },
  )
  paymentTransactions: PaymentTransaction[];
}
