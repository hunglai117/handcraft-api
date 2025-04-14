import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import config from "src/config";

@Module({
  imports: [
    ConfigModule.forRoot({ load: config }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return {
          type: configService.getOrThrow<string>("typeorm.type") as any,
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
  ],
  providers: [],
  exports: [ConfigModule],
})
export class SharedModule {}
