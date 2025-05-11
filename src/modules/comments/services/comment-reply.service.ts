import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommentReply } from "../entities/comment-reply.entity";
import { CreateCommentReplyDto } from "../dto/create-comment-reply.dto";
import { UpdateCommentReplyDto } from "../dto/update-comment-reply.dto";
import { User, UserRole } from "../../users/entities/user.entity";
import { Comment } from "../entities/comment.entity";

@Injectable()
export class CommentReplyService {
  constructor(
    @InjectRepository(CommentReply)
    private readonly commentReplyRepository: Repository<CommentReply>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(
    createCommentReplyDto: CreateCommentReplyDto,
    admin: User,
  ): Promise<CommentReply> {
    // Check if user is an admin
    if (admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admins can reply to comments");
    }

    // Check if comment exists
    const comment = await this.commentRepository.findOne({
      where: { id: createCommentReplyDto.commentId },
    });

    if (!comment) {
      throw new NotFoundException(
        `Comment with ID ${createCommentReplyDto.commentId} not found`,
      );
    }

    const commentReply = this.commentReplyRepository.create({
      ...createCommentReplyDto,
      userId: admin.id,
      isAdminReply: true,
    });

    return this.commentReplyRepository.save(commentReply);
  }

  async findByCommentId(commentId: string): Promise<CommentReply[]> {
    return this.commentReplyRepository.find({
      where: { commentId },
      relations: ["admin"],
    });
  }

  async findOne(id: string): Promise<CommentReply> {
    const reply = await this.commentReplyRepository.findOne({
      where: { id },
      relations: ["admin", "comment"],
    });

    if (!reply) {
      throw new NotFoundException(`Comment reply with ID ${id} not found`);
    }

    return reply;
  }

  async update(
    id: string,
    updateCommentReplyDto: UpdateCommentReplyDto,
    admin: User,
  ): Promise<CommentReply> {
    const reply = await this.findOne(id);

    // Check if user is the admin who created the reply
    if (reply.userId !== admin.id && admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to update this reply",
      );
    }

    return this.commentReplyRepository.save({
      ...reply,
      ...updateCommentReplyDto,
    });
  }

  async remove(id: string, admin: User): Promise<void> {
    const reply = await this.findOne(id);

    // Check if user is the admin who created the reply or a super admin
    if (reply.userId !== admin.id && admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to delete this reply",
      );
    }

    await this.commentReplyRepository.remove(reply);
  }
}
