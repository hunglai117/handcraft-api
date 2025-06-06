import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/user.decorator";
import { PaginationQueryDto } from "../shared/dtos/pagination.dto";
import {
  BadRequestResponseDto,
  ConflictResponseDto,
  ForbiddenResponseDto,
  NotFoundResponseDto,
  UnauthorizedResponseDto,
} from "../shared/shared.dto";
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from "./dto/create-user.dto";
import { PaginatedUserResponseDto } from "./dto/get-all-user.dto";
import { UpdateProfileRequestDto } from "./dto/update-profile.dto";
import { UserProviderDto } from "./dto/user-provider.dto";
import { UserDto } from "./dto/user.dto";
import { UserRole } from "./entities/user.entity";
import { UserProviderService } from "./user-provider.service";
import { UsersService } from "./users.service";

@ApiTags("Users-Admin")
@Controller("users")
@ApiBearerAuth()
@ApiBadRequestResponse({
  description: "Bad request",
  type: BadRequestResponseDto,
})
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Create user (admin only)",
  })
  @ApiCreatedResponse({
    description: "User successfully created",
    type: CreateUserResponseDto,
  })
  @ApiConflictResponse({
    description: "Email already exists",
    type: ConflictResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: "Forbidden - Requires admin role",
    type: ForbiddenResponseDto,
  })
  @ApiBody({ type: CreateUserRequestDto })
  async create(
    @Body() CreateUserRequestDto: CreateUserRequestDto,
  ): Promise<UserDto> {
    const user = await this.usersService.create(CreateUserRequestDto);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: "Get all users (admin only)",
  })
  @ApiOkResponse({
    description: "Paginated list of users",
    type: PaginatedUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: "Forbidden - Requires admin role",
    type: ForbiddenResponseDto,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedUserResponseDto> {
    const users = await this.usersService.findAll(paginationQuery);
    return plainToInstance(PaginatedUserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get user by ID (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiOkResponse({ description: "User details", type: UserDto })
  @ApiNotFoundResponse({
    description: "User not found",
    type: NotFoundResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: "Forbidden - Requires admin role",
    type: ForbiddenResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<UserDto> {
    const user = await this.usersService.findById(id);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete user (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiNoContentResponse({ description: "User successfully deleted" })
  @ApiNotFoundResponse({
    description: "User not found",
    type: NotFoundResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: "Forbidden - Requires admin role",
    type: ForbiddenResponseDto,
  })
  remove(@Param("id") id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}

@ApiTags("Users")
@Controller("users")
@ApiBearerAuth()
@ApiBadRequestResponse({
  description: "Bad request",
  type: BadRequestResponseDto,
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userProviderService: UserProviderService,
  ) {}

  @Get("profile")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Retrieve the authenticated user's profile",
  })
  @ApiOkResponse({ description: "User profile details", type: UserDto })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
    type: NotFoundResponseDto,
  })
  async getProfile(@CurrentUser("id") userId: string): Promise<UserDto> {
    const user = await this.usersService.findById(userId);
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Put("profile")
  @ApiOperation({
    summary: "Update current user profile",
    description: "Update the authenticated user's profile",
  })
  @ApiOkResponse({ description: "Profile successfully updated", type: UserDto })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
    type: NotFoundResponseDto,
  })
  @ApiBody({ type: UpdateProfileRequestDto })
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() updateProfileDto: UpdateProfileRequestDto,
  ): Promise<UserDto> {
    const user = await this.usersService.updateProfile(
      userId,
      updateProfileDto,
    );
    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get("profile/providers")
  @ApiOperation({
    summary: "Get current user's linked social providers",
    description:
      "Retrieve all social providers linked to the authenticated user's account",
  })
  @ApiOkResponse({
    description: "User's linked social providers",
    type: [UserProviderDto],
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized",
    type: UnauthorizedResponseDto,
  })
  async getUserProviders(
    @CurrentUser("id") userId: string,
  ): Promise<UserProviderDto[]> {
    const providers = await this.userProviderService.findAllByUserId(userId);
    return plainToInstance(UserProviderDto, providers, {
      excludeExtraneousValues: true,
    });
  }
}
