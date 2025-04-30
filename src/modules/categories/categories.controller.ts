import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { Public } from "../auth/decorators/public.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { NotFoundResponseDto } from "../shared/shared.dto";
import { UserRole } from "../users/entities/user.entity";
import { CategoriesService } from "./categories.service";
import { CategoryDto } from "./dto/category.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { GetCategoryQueryParamDto } from "./dto/get-category.dto";
import { GetMenuCategoryResponseDto } from "./dto/get-menu-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";

@ApiTags("Categories-Admin")
@Controller("categories")
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new category (admin only)" })
  @ApiResponse({
    status: 201,
    description: "The category has been successfully created.",
    type: Category,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a category (admin only)" })
  @ApiParam({
    name: "id",
    description: "Category ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "The category has been successfully updated.",
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found.",
    type: NotFoundResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }
}

@ApiTags("Categories")
@Controller("categories")
@Public()
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get("/menu")
  @ApiOperation({ summary: "Get all categories for the menu" })
  @ApiResponse({
    status: 200,
    description: "Return all categories for the menu.",
    type: GetMenuCategoryResponseDto,
  })
  async getMenuCategories(): Promise<GetMenuCategoryResponseDto> {
    const categories = await this.categoriesService.getMenuCategories();
    return plainToInstance(
      GetMenuCategoryResponseDto,
      { categories },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiParam({
    name: "id",
    description: "Category ID",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Return the category.",
    type: CategoryDto,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found.",
    type: NotFoundResponseDto,
  })
  async findOneById(
    @Param("id") id: string,
    @Query() query: GetCategoryQueryParamDto,
  ): Promise<CategoryDto> {
    const { includeChildren, includeParents } = query;
    const category = await this.categoriesService.findOne(
      id,
      includeChildren,
      includeParents,
    );
    return plainToInstance(CategoryDto, category, {
      excludeExtraneousValues: true,
    });
  }
}
