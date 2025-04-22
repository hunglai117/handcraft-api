import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { OrderStatus } from "./order-status.enum";
import { PaymentMethod } from "./payment-method.enum";
import { OrderItem } from "./order-item.entity";

@Entity("orders")
export class Order extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "user_id" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    nullable: false,
    name: "payment_method",
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: false,
    name: "total_amount",
  })
  totalAmount: number;

  @Column({ type: "text", nullable: true, name: "shipping_address" })
  shippingAddress: string;

  @Column({ nullable: true, length: 100, name: "shipping_city" })
  shippingCity: string;

  @Column({ nullable: true, length: 100, name: "shipping_state" })
  shippingState: string;

  @Column({ nullable: true, length: 20, name: "shipping_zip" })
  shippingZip: string;

  @Column({ nullable: true, length: 100, name: "shipping_country" })
  shippingCountry: string;

  @Column({ nullable: true, length: 50, name: "tracking_number" })
  trackingNumber: string;

  @Column({ nullable: true, type: "text", name: "notes" })
  notes: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  orderItems: OrderItem[];
}
