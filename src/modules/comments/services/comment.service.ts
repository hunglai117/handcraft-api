import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment, CommentStatus } from "../entities/comment.entity";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { UpdateCommentDto } from "../dto/update-comment.dto";
import { User, UserRole } from "../../users/entities/user.entity";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId: user.id,
    });

    return this.commentRepository.save(comment);
  }

  async findAll(status?: CommentStatus): Promise<Comment[]> {
    const query = this.commentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.user", "user")
      .leftJoinAndSelect("comment.replies", "replies")
      .leftJoinAndSelect("replies.admin", "admin");

    if (status) {
      query.where("comment.status = :status", { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ["user", "replies", "replies.admin"],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if user owns the comment or is an admin
    if (comment.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to update this comment",
      );
    }

    // Regular users can only update content of their own comments
    if (user.role !== UserRole.ADMIN && updateCommentDto.status) {
      throw new ForbiddenException("Only admins can update comment status");
    }

    return this.commentRepository.save({
      ...comment,
      ...updateCommentDto,
    });
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.findOne(id);

    // Check if user owns the comment or is an admin
    if (comment.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "You don't have permission to delete this comment",
      );
    }

    await this.commentRepository.remove(comment);
  }
}
