import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCommentReplyDto {
  @ApiProperty({
    description: "Content of the reply",
    example: "Thank you for your feedback!",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}
