import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment, CommentStatus } from "../../comments/entities/comment.entity";
import { CommentReply } from "../../comments/entities/comment-reply.entity";
import { CommentService } from "../../comments/services/comment.service";
import { CommentReplyService } from "../../comments/services/comment-reply.service";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class AdminCommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentReply)
    private readonly commentReplyRepository: Repository<CommentReply>,
    private readonly commentService: CommentService,
    private readonly commentReplyService: CommentReplyService,
  ) {}

  async findAll(status?: CommentStatus) {
    const queryBuilder = this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .leftJoinAndSelect("comment.product", "product")
      .leftJoinAndSelect("comment.replies", "replies")
      .leftJoinAndSelect("replies.user", "replyUser")
      .orderBy("comment.createdAt", "DESC");

    if (status) {
      queryBuilder.where("comment.status = :status", { status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ["user", "product", "replies", "replies.user"],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async approveComment(id: string, adminUser: User) {
    const comment = await this.findOne(id);
    comment.status = CommentStatus.APPROVED;
    comment.moderatedBy = adminUser.id;
    comment.moderatedAt = new Date();

    return this.commentRepository.save(comment);
  }

  async rejectComment(id: string, adminUser: User, reason?: string) {
    const comment = await this.findOne(id);
    comment.status = CommentStatus.REJECTED;
    comment.moderationReason = reason;
    comment.moderatedBy = adminUser.id;
    comment.moderatedAt = new Date();

    return this.commentRepository.save(comment);
  }

  async removeComment(id: string) {
    const comment = await this.findOne(id);

    // Remove all replies first
    await this.commentReplyRepository.delete({ commentId: id });

    // Then remove the comment
    await this.commentRepository.remove(comment);

    return {
      success: true,
      message: "Comment and all replies removed successfully",
    };
  }

  async replyToComment(commentId: string, adminUser: User, content: string) {
    const comment = await this.findOne(commentId);

    const reply = new CommentReply();
    reply.content = content;
    reply.userId = adminUser.id;
    reply.comment = comment;
    reply.isAdminReply = true;

    return this.commentReplyRepository.save(reply);
  }

  async removeReply(replyId: string) {
    const reply = await this.commentReplyRepository.findOneBy({ id: replyId });

    if (!reply) {
      throw new NotFoundException(`Reply with ID ${replyId} not found`);
    }

    await this.commentReplyRepository.remove(reply);
    return { success: true, message: "Reply removed successfully" };
  }

  async getCommentStats() {
    // Get counts by status
    const [totalComments, pendingComments, approvedComments, rejectedComments] =
      await Promise.all([
        this.commentRepository.count(),
        this.commentRepository.count({
          where: { status: CommentStatus.PENDING },
        }),
        this.commentRepository.count({
          where: { status: CommentStatus.APPROVED },
        }),
        this.commentRepository.count({
          where: { status: CommentStatus.REJECTED },
        }),
      ]);

    // Get average rating from comments
    const averageRating = await this.commentRepository
      .createQueryBuilder("comment")
      .where("comment.status = :status", { status: CommentStatus.APPROVED })
      .select("AVG(comment.rating)", "average")
      .getRawOne();

    // Get comment count by product
    const commentsByProduct = await this.commentRepository
      .createQueryBuilder("comment")
      .leftJoin("comment.product", "product")
      .select("product.name", "productName")
      .addSelect("COUNT(comment.id)", "commentCount")
      .groupBy("product.name")
      .orderBy("commentCount", "DESC")
      .limit(10)
      .getRawMany();

    return {
      totalComments,
      pendingComments,
      approvedComments,
      rejectedComments,
      averageRating: averageRating?.average || 0,
      commentsByProduct,
    };
  }
}
