import { Module } from "@nestjs/common";
import { UsersModule } from "./modules/users/users.module";
import { SharedModule } from "./modules/shared/shared.module";
import { ProductsModule } from "./modules/products/products.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import configs from "./config";

@Module({
  imports: [
    SharedModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    PromotionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    AuthModule,
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get("app.env") === "production";
        const consoleFormat = winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.ms(),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, ms, context, ...meta }) => {
              const contextString = context ? `[${context}]` : "";
              const metaString =
                Object.keys(meta).length > 2
                  ? `\n${JSON.stringify(meta, null, 2)}`
                  : "";
              return `${timestamp} ${level} ${contextString}: ${message} ${ms}${metaString}`;
            },
          ),
        );

        const fileFormat = winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.json(),
        );

        const transports: winston.transport[] = [
          new winston.transports.Console({
            level: isProduction ? "info" : "debug",
            format: consoleFormat,
          }),
        ];

        if (isProduction || configService.get("app.enableFileLogging")) {
          const fileTransportOptions = {
            dirname: "logs",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
            format: fileFormat,
          };

          transports.push(
            new DailyRotateFile({
              ...fileTransportOptions,
              filename: "error-%DATE%.log",
              level: "error",
            }) as winston.transport,

            new DailyRotateFile({
              ...fileTransportOptions,
              filename: "warn-%DATE%.log",
              level: "warn",
            }) as winston.transport,

            new DailyRotateFile({
              ...fileTransportOptions,
              filename: "info-%DATE%.log",
              level: "info",
            }) as winston.transport,

            new DailyRotateFile({
              ...fileTransportOptions,
              filename: "combined-%DATE%.log",
              level: isProduction ? "info" : "debug",
            }) as winston.transport,
          );
        }

        return {
          level: isProduction ? "info" : "debug",
          format: fileFormat,
          transports,
          exceptionHandlers: [
            new winston.transports.File({ filename: "logs/exceptions.log" }),
            new winston.transports.Console({
              format: consoleFormat,
            }),
          ],
          rejectionHandlers: [
            new winston.transports.File({ filename: "logs/rejections.log" }),
            new winston.transports.Console({
              format: consoleFormat,
            }),
          ],
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
