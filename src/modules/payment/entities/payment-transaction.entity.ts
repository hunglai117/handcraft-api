/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { PaymentStatus } from "../enums/payment-status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Order } from "src/modules/order/entities/order.entity";

@Entity("payment_transactions")
export class PaymentTransaction extends BaseEntity {
  @ApiProperty({ description: "Order ID associated with this transaction" })
  @Column({ type: "bigint", nullable: false, name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.paymentTransactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ApiProperty({ description: "Transaction ID from the payment provider" })
  @Column({
    length: 255,
    nullable: false,
    unique: true,
    name: "transaction_id",
  })
  transactionId: string;

  @ApiProperty({
    description: "Payment method used (e.g., credit_card, paypal)",
  })
  @Column({ length: 50, nullable: false, name: "payment_method" })
  paymentMethod: string;

  @ApiProperty({ description: "Transaction amount" })
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @ApiProperty({ description: "Payment status" })
  @Column({
    length: 50,
    default: PaymentStatus.PENDING,
    name: "payment_status",
  })
  paymentStatus: string;

  @ApiProperty({ description: "Additional transaction data" })
  @Column({ name: "metadata", type: "json", nullable: true })
  metadata?: Record<string, any>;
}
