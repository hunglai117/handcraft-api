import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { PaginatedResponseDto } from "../../shared/dtos/paginated-response.dto";
import { UserDto } from "./user.dto";

export class PaginatedUserResponseDto extends PaginatedResponseDto<UserDto> {
  @ApiProperty({
    description: "Array of user items",
    type: [UserDto],
  })
  @Type(() => UserDto)
  @Expose()
  items: UserDto[];
}
