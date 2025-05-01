import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { WinstonModule } from "nest-winston";
import config from "src/config";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

@Module({
  imports: [
    ConfigModule.forRoot({ load: config, isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return {
          type: configService.getOrThrow<string>("typeorm.type") as "postgres",
          host: configService.getOrThrow<string>("typeorm.host"),
          port: configService.getOrThrow<number>("typeorm.port"),
          username: configService.getOrThrow<string>("typeorm.username"),
          password: configService.getOrThrow<string>("typeorm.password"),
          database: configService.getOrThrow<string>("typeorm.database"),
          entities: [__dirname + "/../../**/*.entity{.ts,.js}"],
          synchronize:
            configService.getOrThrow<string>("typeorm.synchronize") === "true",
          logging:
            configService.getOrThrow<string>("typeorm.logging") === "true",
          ssl:
            configService.getOrThrow<string>("typeorm.ssl") === "true"
              ? { rejectUnauthorized: false }
              : false,
          migrations: [__dirname + "/../../migrations/**/*{.ts,.js}"],
          migrationsTableName: "migrations",
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow<string>("redis.host"),
          port: configService.getOrThrow<number>("redis.port"),
          password: configService.getOrThrow<string>("redis.password"),
          keyPrefix: configService.getOrThrow<string>("redis.keyPrefix"),
        },
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: true,
          removeOnFail: false,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        },
      }),
    }),
    BullModule.registerQueue({
      name: "orders",
    }),
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
  providers: [],
  exports: [ConfigModule, BullModule],
})
export class SharedModule {}
