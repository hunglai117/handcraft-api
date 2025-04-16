import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { plainToClass } from "class-transformer";
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
} from "../shared/shared.dto";
import { CreateUserRequestDto } from "../users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { LoginResponseDto, RegisterResponseDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";

@ApiTags("Authentication")
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
    type: CreateUserRequestDto,
  })
  @ApiCreatedResponse({
    description: "User successfully registered",
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input or email already exists",
    type: BadRequestResponseDto,
  })
  async register(
    @Body() CreateUserRequestDto: CreateUserRequestDto,
  ): Promise<RegisterResponseDto> {
    const resp = await this.authService.register(CreateUserRequestDto);
    return plainToClass(RegisterResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }
}
