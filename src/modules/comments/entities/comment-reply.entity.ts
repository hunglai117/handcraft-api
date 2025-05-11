import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { Comment } from "./comment.entity";

@Entity("comment_replies")
export class CommentReply extends BaseEntity {
  @Column({ type: "text", nullable: false })
  content: string;

  @Column({ name: "user_id", type: "bigint", nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "is_admin_reply", type: "boolean", default: false })
  isAdminReply: boolean;

  @Column({ name: "comment_id", type: "bigint", nullable: false })
  commentId: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "comment_id" })
  comment: Comment;
}
