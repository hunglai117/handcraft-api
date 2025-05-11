import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { CommentStatus } from "../entities/comment.entity";

export class UpdateCommentDto {
  @ApiProperty({
    description: "Content of the comment",
    example: "This is a great product!",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @ApiProperty({
    description: "Status of the comment",
    enum: CommentStatus,
    example: CommentStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}
