import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        return false;
      }

      const payload = await this.jwtService.verifyAsync(token);

      // Attach the user to the socket instance
      client["user"] = payload;

      // Subscribe the user to their personal room for updates
      if (payload.sub) {
        client.join(`user-${payload.sub}`);
      }

      return true;
    } catch (err) {
      throw new WsException("Unauthorized access");
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth = client.handshake.headers.authorization;
    if (!auth || Array.isArray(auth)) {
      return undefined;
    }

    const [type, token] = auth.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}
