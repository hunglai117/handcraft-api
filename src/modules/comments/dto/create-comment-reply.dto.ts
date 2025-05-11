import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentReplyDto {
  @ApiProperty({
    description: "Content of the reply",
    example: "Thank you for your feedback!",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty({
    description: "ID of the comment being replied to",
    example: "1",
  })
  @IsNotEmpty()
  @IsString()
  commentId: string;
}
