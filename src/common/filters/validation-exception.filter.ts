import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthPayload } from "src/modules/auth/auth.type";
import { v4 as uuidv4 } from "uuid";

@Catch()
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorId = uuidv4();
    const timestamp = new Date().toISOString();

    const method = request.method;
    const url = request.originalUrl || request.url;
    const userId = (request.user as AuthPayload)?.sub || "anonymous";
    const ip = request.ip;

    const logContext = {
      params: request.params,
      query: request.query,
      body: this.sanitizeBody(request.body),
      ip,
      userAgent: request.headers["user-agent"],
      userId,
      headers: this.sanitizeHeaders(request.headers),
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exceptionResponse = exception.getResponse() as any;

      const errorMessage = this.formatErrorMessage(exceptionResponse.message);
      const stack = exception.stack ? `\n${exception.stack}` : "";

      if (status >= 500) {
        this.logger.error(
          `[${errorId}] ${status} Server Error: ${method} ${url} - ${errorMessage}${stack}`,
          logContext,
        );
      } else if (status >= 400) {
        this.logger.warn(
          `[${errorId}] ${status} ${method} ${url} - ${errorMessage}${stack}`,
          logContext,
        );
      } else {
        this.logger.log(`[${errorId}] ${status} ${method} ${url}`, logContext);
      }

      if (status >= 500) {
        return response.status(status).json({
          ...exceptionResponse,
          errorId,
          timestamp,
        });
      }

      return response.status(status).json(exceptionResponse);
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const error =
      exception instanceof Error ? exception : new Error("Unknown error");

    const stack = error.stack ? `\n${error.stack}` : "";
    this.logger.error(
      `[${errorId}] 500 Unhandled Exception: ${method} ${url} - ${error.message}${stack}`,
      logContext,
    );

    return response.status(status).json({
      statusCode: status,
      message: "Internal server error",
      errorId,
      timestamp,
    });
  }

  private formatErrorMessage(message: string | string[]): string {
    if (!message) return "No error message";

    if (Array.isArray(message)) {
      return message.length > 0 ? message.join(", ") : "No error message";
    }

    return message;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = [
      "password",
      "passwordConfirmation",
      "currentPassword",
      "token",
      "secret",
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;

    const sanitized = { ...headers };
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = "[REDACTED]";
      }
    });

    return sanitized;
  }
}
