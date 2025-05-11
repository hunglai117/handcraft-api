import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { CommentService } from "../services/comment.service";
import { CreateCommentDto } from "../dto/create-comment.dto";
import { UpdateCommentDto } from "../dto/update-comment.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../users/entities/user.entity";
import { CommentStatus } from "../entities/comment.entity";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";

@ApiTags("comments")
@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new comment" })
  @ApiResponse({ status: 201, description: "Comment created successfully" })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentService.create(createCommentDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get all approved comments" })
  @ApiResponse({ status: 200, description: "Return all approved comments" })
  findAll(@Query("status") status: CommentStatus = CommentStatus.APPROVED) {
    return this.commentService.findAll(status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific comment by ID" })
  @ApiResponse({ status: 200, description: "Return the comment" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  findOne(@Param("id") id: string) {
    return this.commentService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a comment" })
  @ApiResponse({ status: 200, description: "Comment updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  update(
    @Param("id") id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentService.update(id, updateCommentDto, user);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a comment" })
  @ApiResponse({ status: 200, description: "Comment deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Comment not found" })
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.commentService.remove(id, user);
  }
}
