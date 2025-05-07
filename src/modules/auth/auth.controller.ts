import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Delete,
  Param,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { plainToClass } from "class-transformer";
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
} from "../shared/shared.dto";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { LoginResponseDto, RegisterResponseDto } from "./dto/auth-response.dto";
import { LoginDto, RegisterDto } from "./dto/auth-request.dto";
import { SocialAuthRequestDto } from "./dto/social-auth.dto";
import { ProviderType } from "../users/entities/user-provider.entity";
import { CurrentUser } from "./decorators/user.decorator";
import { VerifyTokenDto, VerifyTokenResponseDto } from "./dto/verify-token.dto";

@ApiTags("Authentication-Public")
@Controller("auth")
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login user",
    description:
      "Authenticate a user with email and password and return a JWT token",
  })
  @ApiBody({
    type: LoginDto,
    description: "User credentials",
  })
  @ApiOkResponse({
    description: "User successfully authenticated",
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials provided",
    type: UnauthorizedResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input",
    type: BadRequestResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const resp = await this.authService.login(loginDto);
    return plainToClass(LoginResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register user",
    description: "Create a new user account and return a JWT token",
  })
  @ApiBody({
    type: RegisterDto,
  })
  @ApiCreatedResponse({
    description: "User successfully registered",
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input or email already exists",
    type: BadRequestResponseDto,
  })
  async register(@Body() body: RegisterDto): Promise<RegisterResponseDto> {
    const resp = await this.authService.register(body);
    return plainToClass(RegisterResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }

  @Post("social-login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login with social provider",
    description:
      "Authenticate using a social provider token (Google, Facebook, etc.)",
  })
  @ApiBody({
    type: SocialAuthRequestDto,
    description: "Social provider token details",
  })
  @ApiOkResponse({
    description: "User successfully authenticated",
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid token provided",
    type: UnauthorizedResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input",
    type: BadRequestResponseDto,
  })
  async socialLogin(
    @Body() socialAuthDto: SocialAuthRequestDto,
  ): Promise<LoginResponseDto> {
    const resp = await this.authService.socialLogin(socialAuthDto);
    return plainToClass(LoginResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }

  @Post("verify-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify JWT token",
    description: "Verify if a JWT token is valid and return token information",
  })
  @ApiBody({
    type: VerifyTokenDto,
    description: "JWT token to verify",
  })
  @ApiOkResponse({
    description: "Token verification result",
    type: VerifyTokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input",
    type: BadRequestResponseDto,
  })
  async verifyToken(
    @Body() verifyTokenDto: VerifyTokenDto,
  ): Promise<VerifyTokenResponseDto> {
    const result = await this.authService.verifyToken(verifyTokenDto.token);
    return plainToClass(VerifyTokenResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}

@ApiTags("Authentication")
@Controller("auth")
export class NotPublicAuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @Post("link-provider")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Link social provider to account",
    description:
      "Link a social provider account to the current authenticated user",
  })
  @ApiBody({
    type: SocialAuthRequestDto,
    description: "Social provider token details",
  })
  @ApiOkResponse({
    description: "Provider successfully linked",
  })
  @ApiBadRequestResponse({
    description: "Invalid input or provider already linked to another account",
    type: BadRequestResponseDto,
  })
  async linkProvider(
    @CurrentUser("id") userId: string,
    @Body() socialAuthDto: SocialAuthRequestDto,
  ) {
    return this.authService.linkProvider(userId, socialAuthDto);
  }

  @ApiBearerAuth()
  @Delete("unlink-provider/:provider")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Unlink social provider from account",
    description:
      "Remove a linked social provider from the current authenticated user",
  })
  @ApiParam({
    name: "provider",
    enum: ProviderType,
    description: "Provider type to unlink",
  })
  @ApiOkResponse({
    description: "Provider successfully unlinked",
  })
  @ApiBadRequestResponse({
    description: "Provider not linked to account",
    type: BadRequestResponseDto,
  })
  async unlinkProvider(
    @CurrentUser("id") userId: string,
    @Param("provider") provider: ProviderType,
  ) {
    return this.authService.unlinkProvider(userId, provider);
  }
}
