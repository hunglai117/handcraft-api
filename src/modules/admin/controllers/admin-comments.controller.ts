import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { AdminCommentService } from "../services/admin-comment.service";
import { CommentStatus } from "../../comments/entities/comment.entity";
import { CurrentUser } from "../../auth/decorators/user.decorator";
import { User } from "../../users/entities/user.entity";

class RejectCommentDto {
  reason?: string;
}

class AdminReplyDto {
  content: string;
}

@ApiTags("admin/comments")
@Controller("admin/comments")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminCommentsController {
  constructor(private readonly adminCommentService: AdminCommentService) {}

  @Get()
  @ApiOperation({ summary: "Get all comments with optional status filter" })
  @ApiQuery({
    name: "status",
    enum: CommentStatus,
    required: false,
    description: "Filter comments by status",
  })
  @ApiResponse({
    status: 200,
    description: "Return filtered comments",
  })
  async findAll(@Query("status") status?: CommentStatus) {
    return this.adminCommentService.findAll(status);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get comment statistics" })
  @ApiResponse({
    status: 200,
    description: "Return comment statistics",
  })
  async getCommentStats() {
    return this.adminCommentService.getCommentStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific comment" })
  @ApiParam({
    name: "id",
    description: "Comment ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Return the comment",
  })
  @ApiResponse({
    status: 404,
    description: "Comment not found",
  })
  async findOne(@Param("id") id: string) {
    return this.adminCommentService.findOne(id);
  }

  @Post(":id/approve")
  @ApiOperation({ summary: "Approve a comment" })
  @ApiParam({
    name: "id",
    description: "Comment ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Comment approved successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Comment not found",
  })
  async approveComment(@Param("id") id: string, @CurrentUser() admin: User) {
    return this.adminCommentService.approveComment(id, admin);
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Reject a comment" })
  @ApiParam({
    name: "id",
    description: "Comment ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Comment rejected successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Comment not found",
  })
  async rejectComment(
    @Param("id") id: string,
    @Body() rejectDto: RejectCommentDto,
    @CurrentUser() admin: User,
  ) {
    return this.adminCommentService.rejectComment(id, admin, rejectDto.reason);
  }

  @Post(":id/reply")
  @ApiOperation({ summary: "Reply to a comment as admin" })
  @ApiParam({
    name: "id",
    description: "Comment ID",
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: "Reply added successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Comment not found",
  })
  async replyToComment(
    @Param("id") id: string,
    @Body() replyDto: AdminReplyDto,
    @CurrentUser() admin: User,
  ) {
    return this.adminCommentService.replyToComment(id, admin, replyDto.content);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a comment and all its replies" })
  @ApiParam({
    name: "id",
    description: "Comment ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Comment and replies deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Comment not found",
  })
  async removeComment(@Param("id") id: string) {
    return this.adminCommentService.removeComment(id);
  }

  @Delete("replies/:id")
  @ApiOperation({ summary: "Delete a specific reply" })
  @ApiParam({
    name: "id",
    description: "Reply ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Reply deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Reply not found",
  })
  async removeReply(@Param("id") id: string) {
    return this.adminCommentService.removeReply(id);
  }
}
