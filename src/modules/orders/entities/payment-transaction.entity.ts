import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Order } from "./order.entity";

@Entity("payment_transactions")
export class PaymentTransaction extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.paymentTransactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({
    length: 255,
    nullable: false,
    unique: true,
    name: "transaction_id",
  })
  transactionId: string;

  @Column({ length: 50, nullable: false, name: "payment_method" })
  paymentMethod: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    length: 50,
    default: "pending",
    name: "payment_status",
  })
  paymentStatus: string;
}
