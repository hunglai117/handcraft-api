import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Order } from "./order.entity";
import { ProductVariant } from "../../products/entities/product-variant.entity";

@Entity("order_items")
export class OrderItem extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "bigint", nullable: false, name: "product_variant_id" })
  productVariantId: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: "product_variant_id" })
  productVariant: ProductVariant;

  @Column({ nullable: false })
  quantity: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: false,
    name: "unit_price",
  })
  unitPrice: number;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: false,
    name: "total_price",
  })
  totalPrice: number;
}
