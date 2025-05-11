import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { CommentReply } from "./comment-reply.entity";
import { Product } from "../../products/entities/product.entity";

export enum CommentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("comments")
export class Comment extends BaseEntity {
  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ type: "int", nullable: true })
  rating: number;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "product_id", type: "bigint", nullable: false })
  productId: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({
    type: "enum",
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  status: CommentStatus;

  @Column({ name: "moderated_by", type: "bigint", nullable: true })
  moderatedBy: string;

  @Column({ name: "moderated_at", type: "timestamp", nullable: true })
  moderatedAt: Date;

  @Column({ name: "moderation_reason", type: "text", nullable: true })
  moderationReason: string;

  @OneToMany(() => CommentReply, (reply) => reply.comment, {
    cascade: true,
  })
  replies: CommentReply[];
}
