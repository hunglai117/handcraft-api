import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "../users/dto/login.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { Public } from "./decorators/public.decorator";
import { LoginResponseDto, RegisterResponseDto } from "./dto/auth-response.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { plainToClass } from "class-transformer";

@Controller("auth")
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({
    status: 200,
    description: "User logged in successfully.",
    type: LoginResponseDto,
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const resp = await this.authService.login(loginDto);
    return plainToClass(LoginResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register user" })
  @ApiResponse({
    status: 201,
    description: "User registered successfully.",
    type: RegisterResponseDto,
  })
  async register(
    @Body() createUserDto: CreateUserDto
  ): Promise<RegisterResponseDto> {
    const resp = await this.authService.register(createUserDto);
    return plainToClass(RegisterResponseDto, resp, {
      excludeExtraneousValues: true,
    });
  }
}
