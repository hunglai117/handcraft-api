import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { CommentReply } from "./entities/comment-reply.entity";
import { CommentService } from "./services/comment.service";
import { CommentReplyService } from "./services/comment-reply.service";
import { CommentController } from "./controllers/comment.controller";
import { AdminCommentController } from "./controllers/admin-comment.controller";
import { CommentReplyController } from "./controllers/comment-reply.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentReply])],
  controllers: [
    CommentController,
    AdminCommentController,
    CommentReplyController,
  ],
  providers: [CommentService, CommentReplyService],
  exports: [CommentService, CommentReplyService],
})
export class CommentsModule {}
