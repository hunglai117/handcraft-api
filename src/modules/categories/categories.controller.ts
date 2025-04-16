import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
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
import { RolesGuard } from "../auth/guards/roles.guard";
import { NotFoundResponseDto } from "../shared/shared.dto";
import { UserRole } from "../users/entities/user.entity";
import { CategoriesService } from "./categories.service";
import { CategoryDto } from "./dto/category.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { GetCategoryQueryParamDto } from "./dto/get-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new category (admin only)" })
  @ApiResponse({
    status: 201,
    description: "The category has been successfully created.",
    type: Category,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a category by ID" })
  @ApiParam({
    name: "id",
    description: "Category UUID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
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
  @Public()
  async findOneById(
    @Param("id", ParseUUIDPipe) id: string,
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

  @Put(":id")
  @ApiOperation({ summary: "Update a category (admin only)" })
  @ApiParam({
    name: "id",
    description: "Category UUID",
    type: String,
    example: "550e8400-e29b-41d4-a716-446655440000",
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }
}
