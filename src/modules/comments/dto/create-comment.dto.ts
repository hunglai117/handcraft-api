import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCommentDto {
  @ApiProperty({
    description: "Content of the comment",
    example: "This is a great product!",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}
