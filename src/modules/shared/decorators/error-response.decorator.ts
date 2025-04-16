import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export function ErrorResponse(
  statusCode: HttpStatus,
  errorMessage: string,
  exampleMessages: string[],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <T extends new (...args: any[]) => any>(target: T) {
    ApiProperty({
      type: Number,
      example: statusCode,
    })(target.prototype, "statusCode");

    ApiProperty({
      type: Array,
      example: exampleMessages,
    })(target.prototype, "message");

    ApiProperty({
      type: String,
      example: errorMessage,
    })(target.prototype, "error");

    return target;
  };
}
