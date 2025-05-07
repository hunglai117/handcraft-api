import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthPayload } from "./auth.type";
import { LoginDto, RegisterDto } from "./dto/auth-request.dto";
import { SocialAuthRequestDto } from "./dto/social-auth.dto";
import { ProviderHelperService } from "./provider-helper.service";
import { UserProviderService } from "../users/user-provider.service";
import { ProviderType } from "../users/entities/user-provider.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private providerHelperService: ProviderHelperService,
    private userProviderService: UserProviderService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return user;
      }

      return null;
    } catch {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }

  async register(body: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const user = await this.usersService.create(body);
    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
    };
  }

  async socialLogin(socialAuthDto: SocialAuthRequestDto) {
    const { token, provider } = socialAuthDto;

    try {
      // Validate token with provider and get user info
      const providerUserData =
        await this.providerHelperService.validateProviderToken(provider, token);

      // Check if we have a user already linked to this provider account
      const existingProvider = await this.userProviderService.findByProviderId(
        provider,
        providerUserData.id,
      );

      let user: User;

      // If this provider account is already linked to a user
      if (existingProvider) {
        user = existingProvider.user;

        // Update provider data
        await this.userProviderService.update(existingProvider.id, {
          providerData: providerUserData.data,
        });
      } else {
        // Check if we have a user with the same email
        const existingUser = await this.userRepository.findOne({
          where: { email: providerUserData.email },
        });

        if (existingUser) {
          // Link this provider to existing user
          user = existingUser;
          await this.userProviderService.create(
            user,
            provider,
            providerUserData.id,
            providerUserData.data,
          );
        } else {
          // Create a new user and link provider
          const newUser = this.userRepository.create({
            email: providerUserData.email,
            fullName: providerUserData.name,
          });

          user = await this.userRepository.save(newUser);

          await this.userProviderService.create(
            user,
            provider,
            providerUserData.id,
            providerUserData.data,
          );
        }
      }

      // Generate token
      const payload: AuthPayload = {
        sub: user.id,
        email: user.email,
        fullName: user.fullName,
      };
      const jwtToken = this.jwtService.sign(payload);

      return {
        user,
        token: jwtToken,
      };
    } catch (error) {
      throw new UnauthorizedException(
        `Failed to authenticate with ${provider}: ${error.message}`,
      );
    }
  }

  async linkProvider(userId: string, socialAuthDto: SocialAuthRequestDto) {
    const { token, provider } = socialAuthDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    // Validate token with provider
    const providerUserData =
      await this.providerHelperService.validateProviderToken(provider, token);

    // Check if provider is already linked to another account
    const existingProvider = await this.userProviderService.findByProviderId(
      provider,
      providerUserData.id,
    );

    if (existingProvider && existingProvider.userId !== userId) {
      throw new BadRequestException(
        `This ${provider} account is already linked to another user`,
      );
    }

    // If provider already linked to this user, update it
    if (existingProvider) {
      await this.userProviderService.update(existingProvider.id, {
        providerData: providerUserData.data,
      });
    } else {
      // Create new provider link
      await this.userProviderService.create(
        user,
        provider,
        providerUserData.id,
        providerUserData.data,
      );
    }

    return {
      success: true,
      message: `Successfully linked ${provider} account`,
    };
  }

  async unlinkProvider(userId: string, provider: ProviderType) {
    const providers = await this.userProviderService.findAllByUserId(userId);
    const providerToUnlink = providers.find((p) => p.provider === provider);

    if (!providerToUnlink) {
      throw new BadRequestException(
        `No ${provider} account linked to this user`,
      );
    }

    await this.userProviderService.remove(providerToUnlink.id);

    return {
      success: true,
      message: `Successfully unlinked ${provider} account`,
    };
  }

  async verifyToken(token: string) {
    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);

      // Return token information with validation status
      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        exp: payload.exp,
        message: "Token is valid",
      };
    } catch (error) {
      // Handle different types of JWT errors
      let message = "Invalid token";

      if (error.name === "TokenExpiredError") {
        message = "Token has expired";
      } else if (error.name === "JsonWebTokenError") {
        message = "Invalid token signature";
      } else if (error.name === "NotBeforeError") {
        message = "Token not active yet";
      }

      return {
        valid: false,
        message,
      };
    }
  }
}
