import { Module } from "@nestjs/common";
import { UsersModule } from "./modules/users/users.module";
import { SharedModule } from "./modules/shared/shared.module";
import { ProductsModule } from "./modules/products/products.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import configs from "./config";

@Module({
  imports: [
    SharedModule,
    UsersModule,
    ProductsModule,
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

        return {
          level: isProduction ? "info" : "debug",
          format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.json()
          ),
          defaultMeta: {
            service: configService.get("app.name"),
            environment: configService.get("app.env"),
          },
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                  ({ timestamp, level, message, context, ...meta }) => {
                    const contextString = context ? `[${context}] ` : "";
                    return `${timestamp} [${level}]: ${contextString}${message} ${
                      Object.keys(meta).length > 2
                        ? JSON.stringify(meta, null, 2)
                        : ""
                    }`;
                  }
                )
              ),
            }),
            new winston.transports.File({
              filename: "logs/error.log",
              level: "error",
            }),
            new winston.transports.File({ filename: "logs/combined.log" }),
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
