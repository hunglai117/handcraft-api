import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { ErrorResponse } from "./decorators/error-response.decorator";

@Exclude()
export class SuccessResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    example: "Successful",
    description: "message",
  })
  message: string;
}

export class ErrorResponseDto {
  statusCode: number;
  message: string[];
  error: string;
}

@ErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ["Invalid input data"])
export class BadRequestResponseDto extends ErrorResponseDto {}

@ErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ["Unauthorized"])
export class UnauthorizedResponseDto extends ErrorResponseDto {}

@ErrorResponse(HttpStatus.FORBIDDEN, "Forbidden", ["Forbidden resource"])
export class ForbiddenResponseDto extends ErrorResponseDto {}

@ErrorResponse(HttpStatus.NOT_FOUND, "Not Found", ["Resource not found"])
export class NotFoundResponseDto extends ErrorResponseDto {}

@ErrorResponse(HttpStatus.CONFLICT, "Conflict", ["Resource already exists"])
export class ConflictResponseDto extends ErrorResponseDto {}

@ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", [
  "Internal server error",
])
export class ServerErrorResponseDto extends ErrorResponseDto {}
