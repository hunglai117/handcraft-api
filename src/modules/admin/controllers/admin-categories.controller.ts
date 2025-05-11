import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
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
import { AdminCategoryService } from "../services/admin-category.service";
import { CreateCategoryDto } from "../../categories/dto/create-category.dto";
import { UpdateCategoryDto } from "../../categories/dto/update-category.dto";

@ApiTags("admin/categories")
@Controller("admin/categories")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminCategoriesController {
  constructor(private readonly adminCategoryService: AdminCategoryService) {}

  @Get()
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({
    status: 200,
    description: "Return all categories",
  })
  async findAll() {
    return this.adminCategoryService.findAll();
  }

  @Get("tree")
  @ApiOperation({ summary: "Get category tree structure" })
  @ApiResponse({
    status: 200,
    description: "Return categories in tree structure",
  })
  async getCategoryTree() {
    return this.adminCategoryService.getCategoryTree();
  }

  @Get("stats")
  @ApiOperation({ summary: "Get category statistics" })
  @ApiResponse({
    status: 200,
    description: "Return category statistics",
  })
  async getCategoryStats() {
    return this.adminCategoryService.getCategoryStats();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific category" })
  @ApiParam({
    name: "id",
    description: "Category ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Return the category" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async findOne(@Param("id") id: string) {
    return this.adminCategoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({ status: 201, description: "Category created successfully" })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminCategoryService.create(createCategoryDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a category" })
  @ApiParam({
    name: "id",
    description: "Category ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Category updated successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.adminCategoryService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a category" })
  @ApiParam({
    name: "id",
    description: "Category ID",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Category deleted successfully" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async remove(@Param("id") id: string) {
    return this.adminCategoryService.remove(id);
  }
}
