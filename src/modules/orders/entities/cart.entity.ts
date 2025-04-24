import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { CartItem } from "./cart-item.entity";

@Entity("carts")
export class Cart extends BaseEntity {
  @Column({ type: "bigint", nullable: false, name: "user_id" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true,
    eager: true,
  })
  cartItems: CartItem[];
}
