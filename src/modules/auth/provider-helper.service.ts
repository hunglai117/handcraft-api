import { Injectable, BadRequestException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ProviderType } from "../users/entities/user-provider.entity";
import { AuthProviderData } from "./auth.type";

@Injectable()
export class ProviderHelperService {
  constructor(private readonly httpService: HttpService) {}

  async validateProviderToken(
    provider: ProviderType,
    token: string,
  ): Promise<AuthProviderData> {
    switch (provider) {
      case ProviderType.GOOGLE:
        return this.validateGoogleToken(token);
      case ProviderType.FACEBOOK:
        return this.validateFacebookToken(token);
      default:
        throw new BadRequestException(`Provider ${provider} not supported`);
    }
  }

  private async validateGoogleToken(token: string): Promise<AuthProviderData> {
    try {
      const response = await firstValueFrom(
        this.httpService.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const userData = response.data;
      return {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        data: userData,
      };
    } catch (error) {
      throw new BadRequestException("Invalid Google token");
    }
  }

  private async validateFacebookToken(
    token: string,
  ): Promise<AuthProviderData> {
    try {
      const fields = "id,name,email";
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.facebook.com/me?fields=${fields}&access_token=${token}`,
        ),
      );

      const userData = response.data;
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        data: userData,
      };
    } catch (error) {
      throw new BadRequestException("Invalid Facebook token");
    }
  }
}
