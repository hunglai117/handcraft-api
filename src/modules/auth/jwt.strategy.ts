import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";
import { AuthPayload } from "./auth.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("auth.jwt.secret"),
    });
  }

  async validate(payload: AuthPayload): Promise<Omit<User, "password">> {
    try {
      const user = await this.usersService.findById(payload.sub);
      delete user.password;
      return user;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
