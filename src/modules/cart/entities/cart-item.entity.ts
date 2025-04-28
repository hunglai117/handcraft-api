import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Cart } from "./cart.entity";
import { ProductVariant } from "../../products/entities/product-variant.entity";

@Entity("cart_items")
export class CartItem extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "cart_id" })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "cart_id" })
  cart: Cart;

  @Column({ type: "bigint", nullable: false, name: "product_variant_id" })
  productVariantId: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: "product_variant_id" })
  productVariant: ProductVariant;

  @Column({ nullable: false, default: 1 })
  quantity: number;
}
