import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { UserRole } from "../../users/entities/user.entity";

import { CreateUserRequestDto } from "../../users/dto/create-user.dto";
import { AdminUpdateUserDto } from "../dto/admin-update-user.dto";
import { AdminUserService } from "../services/admin-user.service";

@ApiTags("admin/users")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @ApiOperation({ summary: "Get all users with optional filters" })
  @ApiResponse({
    status: 200,
    description: "Return all users based on filters",
  })
  async findAll(
    @Query("role") role?: UserRole,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.adminUserService.findAll(role, page, limit);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get user statistics" })
  @ApiResponse({
    status: 200,
    description: "Return user statistics",
  })
  async getUserStats() {
    return this.adminUserService.getUserStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get specific user by ID" })
  @ApiParam({
    name: "id",
    description: "User ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Return the user" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id") id: string) {
    return this.adminUserService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  async create(@Body() createUserDto: CreateUserRequestDto) {
    return this.adminUserService.create(createUserDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a user" })
  @ApiParam({
    name: "id",
    description: "User ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
  ) {
    return this.adminUserService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({
    name: "id",
    description: "User ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id") id: string) {
    return this.adminUserService.remove(id);
  }
}
