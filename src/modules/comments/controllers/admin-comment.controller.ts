import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body,
  Query,
} from "@nestjs/common";
import { CommentService } from "../services/comment.service";
import { UpdateCommentDto } from "../dto/update-comment.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../users/entities/user.entity";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { CommentStatus } from "../entities/comment.entity";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";

@ApiTags("admin/comments")
@Controller("admin/comments")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminCommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({
    summary: "Get all comments with optional status filter (admin only)",
  })
  @ApiResponse({
    status: 200,
    description: "Return all comments based on filter",
  })
  findAll(@Query("status") status?: CommentStatus) {
    return this.commentService.findAll(status);
  }

  @Get("pending")
  @ApiOperation({ summary: "Get all pending comments (admin only)" })
  @ApiResponse({ status: 200, description: "Return all pending comments" })
  findPending() {
    return this.commentService.findAll(CommentStatus.PENDING);
  }

  @Patch(":id/approve")
  @ApiOperation({ summary: "Approve a comment (admin only)" })
  @ApiResponse({ status: 200, description: "Comment approved successfully" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  approve(@Param("id") id: string, @CurrentUser() admin: User) {
    const updateDto: UpdateCommentDto = { status: CommentStatus.APPROVED };
    return this.commentService.update(id, updateDto, admin);
  }

  @Patch(":id/reject")
  @ApiOperation({ summary: "Reject a comment (admin only)" })
  @ApiResponse({ status: 200, description: "Comment rejected successfully" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  reject(@Param("id") id: string, @CurrentUser() admin: User) {
    const updateDto: UpdateCommentDto = { status: CommentStatus.REJECTED };
    return this.commentService.update(id, updateDto, admin);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update any comment (admin only)" })
  @ApiResponse({ status: 200, description: "Comment updated successfully" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  update(
    @Param("id") id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() admin: User,
  ) {
    return this.commentService.update(id, updateCommentDto, admin);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete any comment (admin only)" })
  @ApiResponse({ status: 200, description: "Comment deleted successfully" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  remove(@Param("id") id: string, @CurrentUser() admin: User) {
    return this.commentService.remove(id, admin);
  }
}
