import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Order } from "./order.entity";
import { Product } from "../../products/entities/product.entity";

@Entity("order_items")
export class OrderItem extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "bigint", nullable: false, name: "product_id" })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ nullable: false })
  quantity: number;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: false,
    name: "unit_price",
  })
  unitPrice: number;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
    name: "discount_amount",
  })
  discountAmount: number;

  @Column({ nullable: true, name: "product_name" })
  productName: string;

  @Column({ nullable: true, type: "text", name: "product_notes" })
  productNotes: string;
}
