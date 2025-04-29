import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request: Request = ctx.switchToHttp().getRequest();

    const ip =
      request.headers["x-forwarded-for"] ||
      request.ip ||
      request.socket.remoteAddress ||
      "127.0.0.1";

    return (
      (Array.isArray(ip) ? ip[0] : ip?.toString().split(",")[0]) || "127.0.0.1"
    );
  },
);
