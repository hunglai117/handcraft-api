/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { PaymentStatus } from "../enums/payment-status.enum";
import { Order } from "src/modules/order/entities/order.entity";

@Entity("payment_transactions")
export class PaymentTransaction extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.paymentTransactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ length: 50, nullable: false, name: "payment_method" })
  paymentMethod: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    length: 50,
    default: PaymentStatus.PENDING,
    name: "payment_status",
  })
  paymentStatus: string;

  @Column({ name: "metadata", type: "json", nullable: true })
  metadata?: Record<string, any>;
}
