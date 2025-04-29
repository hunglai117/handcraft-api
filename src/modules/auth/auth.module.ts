import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { ProviderHelperService } from "./provider-helper.service";
import { JwtStrategy } from "./jwt.strategy";
import { UsersModule } from "../users/users.module";
import { AuthController, NotPublicAuthController } from "./auth.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("auth.jwt.secret"),
        signOptions: {
          expiresIn: configService.get("auth.jwt.expiresIn"),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, ProviderHelperService],
  controllers: [AuthController, NotPublicAuthController],
  exports: [AuthService],
})
export class AuthModule {}
