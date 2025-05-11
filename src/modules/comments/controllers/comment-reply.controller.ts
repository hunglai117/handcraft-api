import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { User } from "../../users/entities/user.entity";
import { CreateCommentReplyDto } from "../dto/create-comment-reply.dto";
import { UpdateCommentReplyDto } from "../dto/update-comment-reply.dto";
import { CommentReplyService } from "../services/comment-reply.service";

@ApiTags("comment-replies")
@Controller("comment-replies")
export class CommentReplyController {
  constructor(private readonly commentReplyService: CommentReplyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new comment reply (admin only)" })
  @ApiResponse({
    status: 201,
    description: "Comment reply created successfully",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - only admins can create replies",
  })
  create(
    @Body() createCommentReplyDto: CreateCommentReplyDto,
    @CurrentUser() admin: User,
  ) {
    return this.commentReplyService.create(createCommentReplyDto, admin);
  }

  @Get("comment/:commentId")
  @ApiOperation({ summary: "Get all replies for a specific comment" })
  @ApiResponse({
    status: 200,
    description: "Return all replies for the comment",
  })
  findByCommentId(@Param("commentId") commentId: string) {
    return this.commentReplyService.findByCommentId(commentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific comment reply by ID" })
  @ApiResponse({ status: 200, description: "Return the comment reply" })
  @ApiResponse({ status: 404, description: "Comment reply not found" })
  findOne(@Param("id") id: string) {
    return this.commentReplyService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a comment reply (admin only)" })
  @ApiResponse({
    status: 200,
    description: "Comment reply updated successfully",
  })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Comment reply not found" })
  update(
    @Param("id") id: string,
    @Body() updateCommentReplyDto: UpdateCommentReplyDto,
    @CurrentUser() admin: User,
  ) {
    return this.commentReplyService.update(id, updateCommentReplyDto, admin);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a comment reply (admin only)" })
  @ApiResponse({
    status: 200,
    description: "Comment reply deleted successfully",
  })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Comment reply not found" })
  remove(@Param("id") id: string, @CurrentUser() admin: User) {
    return this.commentReplyService.remove(id, admin);
  }
}
